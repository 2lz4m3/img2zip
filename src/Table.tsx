import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

export type Status = 'waiting' | 'downloading' | 'successful' | 'failed';

export interface Row {
  url: string,
  status: Status,
  description: string,
}

export default function DenseTable({ rows }: { rows: Row[] }) {

  return (
    <TableContainer component={Paper}>
      <Table
        size="small"
      >
        <TableHead>
          <TableRow key="header">
            <TableCell sx={{ minWidth: 100 }}>Status</TableCell>
            <TableCell sx={{ minWidth: 200 }}>Description</TableCell>
            <TableCell>URL</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            rows.length > 0 ?
              rows.map((row) => (
                <TableRow
                  key={row.url}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell sx={{ overflowWrap: 'anywhere' }}>{row.url}</TableCell>
                </TableRow>
              ))
              :
              <TableRow>
                <TableCell colSpan={3}>
                  no valid URLs.
                </TableCell>
              </TableRow>
          }
        </TableBody>
      </Table>
    </TableContainer>
  );
}
