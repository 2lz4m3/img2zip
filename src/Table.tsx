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
}

export default function DenseTable({ rows }: { rows: Row[] }) {

  return (
    <TableContainer component={Paper}>
      <Table
        size="small"
      >
        <TableHead>
          <TableRow key="header">
            <TableCell sx={{ width: 100 }}>Status</TableCell>
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
                  <TableCell component="th" scope="row" sx={{ width: 100 }}>
                    {row.status}
                  </TableCell>
                  <TableCell>{row.url}</TableCell>
                </TableRow>
              ))
              :
              <TableRow>
                <TableCell colSpan={2}>
                  no valid URLs.
                </TableCell>
              </TableRow>
          }
        </TableBody>
      </Table>
    </TableContainer>
  );
}
