import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { registerProposalTools } from '../../app/lib/proposals/mcp-tools';

async function availableTools(scopes: string[]) {
  const server = new McpServer({ name: 'proposal-scope-test', version: '1.0.0' });
  registerProposalTools(server, 'test-root', scopes);
  const client = new Client({ name: 'test-client', version: '1.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  try {
    return (await client.listTools()).tools.map(tool => tool.name).sort();
  } finally {
    await client.close();
    await server.close();
  }
}

test('read authorization does not expose draft writes or publication', async () => {
  assert.deepEqual(await availableTools(['mcp:read']), [
    'proposals_get', 'proposals_list', 'proposals_templates',
  ]);
});

test('draft authorization cannot publish', async () => {
  assert.deepEqual(await availableTools(['mcp:read', 'mcp:proposals:write']), [
    'proposals_create_draft', 'proposals_get', 'proposals_list',
    'proposals_templates', 'proposals_update_draft',
  ]);
});

test('publication authorization is independent of draft writes', async () => {
  assert.deepEqual(await availableTools(['mcp:read', 'mcp:proposals:publish']), [
    'proposals_get', 'proposals_list', 'proposals_publish', 'proposals_templates',
  ]);
});

test('MCP transport enforces publication confirmation and passes the reviewed revision', async () => {
  const calls: unknown[][]=[];
  const server = new McpServer({ name:'publish-contract', version:'1.0.0' });
  registerProposalTools(server,'verified-root',['mcp:read','mcp:proposals:publish'],async () => ({
    publishProposalDocument: async (...args: unknown[]) => {calls.push(args);return {visibility:'published'};},
  } as any));
  const client=new Client({name:'test',version:'1.0.0'});
  const [a,b]=InMemoryTransport.createLinkedPair(); await server.connect(b); await client.connect(a);
  try {
    const denied=await client.callTool({name:'proposals_publish',arguments:{slug:'test-prospect',expectedRevision:2}});
    assert.equal(denied.isError,true); assert.equal(calls.length,0);
    const accepted=await client.callTool({name:'proposals_publish',arguments:{slug:'test-prospect',expectedRevision:2,confirmation:'PUBLICAR'}});
    assert.notEqual(accepted.isError,true); assert.deepEqual(calls,[['test-prospect',2,'verified-root']]);
    const write=await client.callTool({name:'proposals_create_draft',arguments:{}});
    assert.equal(write.isError,true);
  } finally {await client.close();await server.close();}
});
