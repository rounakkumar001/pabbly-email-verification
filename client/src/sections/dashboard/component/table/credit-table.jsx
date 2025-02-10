import { useTheme } from '@emotion/react';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import { Divider, Tooltip, CardHeader, Typography } from '@mui/material';

import { useSetState } from 'src/hooks/use-set-state';

import { fIsBetween } from 'src/utils/format-time';

import { fetchEmailVerificationResults } from 'src/redux/slice/emailVerificationSlice';

import { Scrollbar } from 'src/components/scrollbar';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { CreditTableRow } from './credit-table-row';
import { CreditTableToolbar } from './credit-table-toolbar';
import { CreditTableFiltersResult } from './credit-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  {
    id: 'statusdate',
    label: 'Status/Date',
    width: 'flex',
    whiteSpace: 'nowrap',
    tooltip: 'Date and time when the email verification action occurred.',
  },

  {
    id: 'message',
    label: 'Message',
    width: 'flex',
    whiteSpace: 'nowrap',
    tooltip: 'Description of the email verification action or status update.',
  },
  {
    id: 'credits',
    label: 'Credits',
    width: 'flex',
    whiteSpace: 'nowrap',
    align: 'right',
    tooltip: 'Current state of the email verification credits.',
  },
];

const dataOn = [
  {
    dateCreatedOn: 'Oct 23, 2024 17:45:32',
    message: 'Used in verifying "SampleImport_(3).csv" list',
    status: 'Verified List',
    credits: 'Consumed',
    noOfCredits: 9,
  },
  {
    dateCreatedOn: 'Oct 23, 2024 17:45:32',
    message: 'Used in verifying "SampleImport_(3).csv" list',
    status: 'Verified List',
    credits: 'Consumed',
    noOfCredits: 7,
  },
  {
    dateCreatedOn: 'Oct 23, 2024 17:45:32',
    message: 'Used in verifying email: ankit.mandli1@pabbly.com',
    status: 'Verified Email',
    credits: 'Consumed',
    noOfCredits: 1,
  },
  {
    dateCreatedOn: 'Oct 23, 2024 17:45:32',
    message: 'Email credits added by Admin',
    status: 'Added',
    credits: 'Alloted',
    noOfCredits: 100,
  },
];

// ----------------------------------------------------------------------

export function CreditTable() {

  const [tableData, setTableData] = useState([]);

  const dispatch = useDispatch();

  const selectVerificationResults = useSelector((state) => state.emailVerificationLogs.verificationResults);

  const {user : {time_zone}} = useSelector((state) => state.user)

  useEffect(() => {
    dispatch(fetchEmailVerificationResults());

  }, [dispatch])

  useEffect(() => {
    const transformedData = selectVerificationResults
    .filter(item => item.status !== 'UNPROCESSED')
    .map(item => {
      const date = new Date(item.created_at);

      const options = {
        year: 'numeric',
        month: 'short', // Abbreviated month name (Oct, Nov, etc.)
        day: 'numeric',
        hour: '2-digit', // 24-hour format
        minute: '2-digit',
        second: '2-digit',
        hour12: false, // Use 24-hour format
        timeZone : time_zone
      };

      const formattedDate = date.toLocaleDateString('en-US', options);

      return {
        dateCreatedOn: formattedDate,
        message: `Used in verifying ${item.source_type === 'EMAIL' ? `email : ${item.source_name}` : `${item.source_name} list`}`,
        status: item.status === 'VERIFIED_LIST' ? "Verified List" : item.status === 'VERIFIED_EMAIL' ? 'Verified Email' : item.status,
        credits: item.credits,
        noOfCredits: item.no_of_credits,
      };
    });
    setTableData(transformedData);
  }, [selectVerificationResults, time_zone]);

  const table = useTable({ defaultOrderBy: 'orderNumber' });

  const theme = useTheme();

  const filters = useSetState({
    name: '',
    status: 'all',
  });

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );
  const canReset =
    !!filters.state.name ||
    filters.state.status !== 'all' ||
    (!!filters.state.startDate && !!filters.state.endDate);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      filters.setState({ status: newValue });
    },
    [filters, table]
  );

  return (
    <Card>
      <CardHeader
        title={
          <Box display="inline-block">
            <Tooltip
              arrow
              placement="top"
              disableInteractive
              title="View all the email verification logs here."
            >
              <Typography variant="h6">Email Verification Logs</Typography>
            </Tooltip>
          </Box>
        }
        sx={{ pb: 3 }}
        subheader="All the email verification logs will appear here."
      />
      <Divider />

      <CreditTableToolbar filters={filters} onResetPage={table.onResetPage} />

      {canReset && (
        <CreditTableFiltersResult
          filters={filters}
          totalResults={dataFiltered.length}
          onResetPage={table.onResetPage}
          sx={{ p: 2.5, pt: 0 }}
        />
      )}

      <Box sx={{ position: 'relative' }}>
        <Scrollbar>
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
            <TableHeadCustom
              showCheckbox={false}
              order={table.order}
              orderBy={table.orderBy}
              headLabel={TABLE_HEAD}
              rowCount={dataFiltered.length}
              numSelected={table.selected.length}
              onSort={table.onSort}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id)
                )
              }
            />

            <TableBody>
              {dataInPage.map((row, index) => (
                <CreditTableRow
                  key={index}
                  row={row}
                  selected={table.selected.includes(row.id)}
                />
              ))}

              <TableEmptyRows
                height={table.dense ? 56 : 56 + 20}
                emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
              />
              {notFound && (
                <TableNoData
                  title="Not Data Found"
                  description="No data found in the table"
                  notFound={notFound}
                />
              )}
            </TableBody>
          </Table>
        </Scrollbar>
      </Box>

      <TablePaginationCustom
        page={table.page}
        count={dataFiltered.length}
        rowsPerPage={table.rowsPerPage}
        onPageChange={table.onChangePage}
        onChangeDense={table.onChangeDense}
        onRowsPerPageChange={table.onChangeRowsPerPage}
      />
    </Card>
  );
}

function applyFilter({ inputData, comparator, filters, dateError }) {
  const { status, name, startDate, endDate } = filters;

  let filteredData = inputData;

  // Filter by message (name)
  if (name) {
    filteredData = filteredData.filter(
      (order) => order.message && order.message.toLowerCase().includes(name.toLowerCase())
    );
  }

  // Filter by status
  if (status !== 'all') {
    filteredData = filteredData.filter((order) => order.credits === status);
  }

  // Filter by date range
  if (!dateError) {
    if (startDate && endDate) {
      filteredData = filteredData.filter((order) =>
        fIsBetween(new Date(order.dateCreatedOn), startDate, endDate)
      );
    }
  }

  return filteredData;
}
