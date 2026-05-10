import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type AdminDataTableProps<T> = {
  title: string;
  description?: string;
  columns: string[];
  rows: T[];
  emptyLabel: string;
  renderRow: (row: T) => ReactNode;
};

export function AdminDataTable<T>({
  title,
  description,
  columns,
  rows,
  emptyLabel,
  renderRow
}: AdminDataTableProps<T>) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{emptyLabel}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>{rows.map(renderRow)}</TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export { TableCell, TableRow };
