import { useTheme } from '@emotion/react';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import {
  Alert,
  Button,
  Divider,
  Tooltip,
  MenuList,
  MenuItem,
  Snackbar,
  CardHeader,
  Typography,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { fIsBetween } from 'src/utils/format-time';

import { varAlpha } from 'src/theme/styles';
import { DASHBOARD_STATUS_OPTIONS } from 'src/_mock/_table/_dashboard';
import { deleteBulkEmailList, fetchEmailVerificationResults } from 'src/redux/slice/emailVerificationSlice';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import {
  useTable,
  rowInPage,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { DashboardTableRow } from './dashboard-table-row';
import { DashboardTableToolbar } from './dashboard-table-toolbar';
import { DashboardTableFiltersResult } from './dashboard-table-filters-result';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'All', tooltip: 'Click here to view all list.' },
  ...DASHBOARD_STATUS_OPTIONS,
];

const TABLE_HEAD = [
  {
    id: 'filename',
    label: 'Status/Name/Date',
    width: 'flex',
    whiteSpace: 'nowrap',
    tooltip: 'View list status, name and date of creation here.',
  },

  {
    id: 'action',
    label: 'Action',
    width: 220,
    whiteSpace: 'nowrap',
    tooltip: 'Take actions on the list here.',
  },

  {
    id: 'report',
    label: 'Report',
    width: 'flex',
    whiteSpace: 'nowrap',
    align: 'right',
    tooltip: 'View any list report here.',
  },
  { id: '', width: 10 },
];

const dataOn = [
  {
    status: 'unprocessed',
    name: 'pabbly_connect_users_email_list.csv',
    numberOfEmails: 65,
    date: 'Oct 23, 2024 17:45:32',
  },
  {
    status: 'processing',
    name: 'pabbly_chatflow_users_email_list.csv',
    numberOfEmails: 65,
    date: 'Oct 23, 2024 17:45:32',
  },
  {
    status: 'completed',
    name: 'clothing_users_email_list.csv',
    numberOfEmails: 653343,
    date: 'Oct 23, 2024 17:45:32',
  },
];

// ----------------------------------------------------------------------

export function DashboardTable() {

  const dispatch = useDispatch();
  const { filteredCSVLogs } = useSelector(state => state.emailVerificationLogs);
  const [rowToDelete, setRowToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchEmailVerificationResults());
  }, [dispatch])


  const table = useTable({ defaultOrderBy: 'orderNumber' });

  const [tableData, setTableData] = useState(
    dataOn.map((item, index) => ({
      ...item,
      id: index, // Add an id to each row for easier identification
    }))
  );

  const handleStartVerification = (rowId) => {
    setProcessingRowId(rowId); // Store the current processing row ID
    setTableData((prevData) =>
      prevData.map((row) => (row.id === rowId ? { ...row, status: 'processing' } : row))
    );
  };

  const filters = useSetState({
    name: '',
    status: 'all',
  });

  const dataFiltered = applyFilter({
    inputData: filteredCSVLogs,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

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
  const isStartVerification = useSelector((state) => state.fileUpload.isStartVerification);
  const isVerificationCompleted = useSelector((state) => state.fileUpload.isVerificationCompleted);
  const [processingRowId, setProcessingRowId] = useState(null);

  useEffect(() => {
    if (isVerificationCompleted && processingRowId !== null) {
      setTableData((prevData) =>
        prevData.map((row) => (row.id === processingRowId ? { ...row, status: 'completed' } : row))
      );
      setProcessingRowId(null); // Reset processing row ID
    }
  }, [isVerificationCompleted, processingRowId]);

  const confirmDelete = useBoolean();

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleOpenPopover = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);

  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarState((prev) => ({ ...prev, open: false }));
  };
  const theme = useTheme();

  const handleConfirmDelete = (rowId) => { // Accept rowId
    confirmDelete.onTrue();
    setRowToDelete(rowId); // Store the ID to delete
    handleClosePopover();
  };

  const handleDelete = async (jobId) => {  // Pass rowId to handleDelete
    try {
      
      dispatch(deleteBulkEmailList(jobId)); // Dispatch delete action with ID
      setSnackbarState({
        open: true,
        message: 'Email list deleted successfully.',
        severity: 'success',
      });

      // Optimistically update the table data after successful deletion
      setTableData((prevData) => prevData.filter((row) => row.jobId !== jobId));

      // Optionally, you can refetch the data after successful deletion if needed:

    } catch (error) {
      console.error("Error deleting list:", error);
      setSnackbarState({
        open: true,
        message: 'Error deleting email list.',
        severity: 'error',
      });
    }
    confirmDelete.onFalse();
    handleClosePopover();
  };



  return (
    <Card>
      <CardHeader
        title={
          <Box display="inline-block">
            <Tooltip
              title="See all your uploaded files and their verification status"
              arrow
              placement="top"
            >
              <Typography variant="h6">Uploaded List</Typography>
            </Tooltip>
          </Box>
        }
        subheader="View all the uploaded list here."
        sx={{ pb: 3 }}
      />
      <Divider />

      <Tabs
        value={filters.state.status}
        onChange={handleFilterStatus}
        sx={{
          px: 2.5,
          boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
        }}
      >
        {STATUS_OPTIONS.map((tab) => (
          <Tab
            key={tab.value}
            iconPosition="end"
            value={tab.value}
            label={
              <Tooltip disableInteractive placement="top" arrow title={tab.tooltip}>
                <span>{tab.label}</span>
              </Tooltip>
            }
            icon={
              <Label
                variant={
                  ((tab.value === 'all' || tab.value === filters.state.status) && 'filled') ||
                  'soft'
                }
                color={
                  (tab.value === 'completed' && 'success') ||
                  (tab.value === 'processing' && 'info') ||
                  (tab.value === 'unprocessed' && 'error') ||
                  'default'
                }
              >
                {['completed', 'processing', 'unprocessed'].includes(tab.value)
                  ? tableData.filter((user) => user.status === tab.value).length
                  : tableData.length}
              </Label>
            }
          />
        ))}
      </Tabs>

      <DashboardTableToolbar filters={filters} onResetPage={table.onResetPage} />

      {canReset && (
        <DashboardTableFiltersResult
          filters={filters}
          totalResults={dataFiltered.length}
          onResetPage={table.onResetPage}
          sx={{ p: 2.5, pt: 0 }}
        />
      )}

      <Box sx={{ position: 'relative' }}>
        {/* <Scrollbar sx={{ minHeight: 444 }}> */}
        <Table size={table.dense ? 'small' : 'medium'} sx={{}}>
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
            {dataFiltered
              .slice(
                table.page * table.rowsPerPage,
                table.page * table.rowsPerPage + table.rowsPerPage
              )
              .map((row, index) => (
                <DashboardTableRow
                  key={index}
                  row={row}
                  selected={table.selected.includes(row._id)}
                  onSelectRow={() => table.onSelectRow(row._id)}
                  onOpenPopover={(event) => handleOpenPopover(event, row)}
                  dashboardTableIndex={table.page * table.rowsPerPage + index}
                  onStartVerification={() => handleStartVerification(row._id)}
                  isProcessing={processingRowId === row._id && isStartVerification}
                  isCompleted={processingRowId === row._id && isVerificationCompleted}
                />
              ))}

            <TableEmptyRows
              height={table.dense ? 56 : 56 + 20}
              emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
            />

            {tableData.length === 0 ? (
              <TableNoData
                title="Not Data Found"
                description="No data found in the table"
                notFound={notFound}
              />
            ) : (
              <TableNoData
                title="Not Search Found"
                description={`No search found with keyword "${filters.state.name}"`}
                notFound={notFound}
              />
            )}
          </TableBody>
        </Table>
        {/* </Scrollbar> */}
      </Box>
      <CustomPopover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <Tooltip title="Delete connection." arrow placement="left">
            <MenuItem onClick={() => handleConfirmDelete(selectedRow.jobId)} sx={{ color: 'error.main' }}>
              <Iconify icon="solar:trash-bin-trash-bold" />
              Delete
            </MenuItem>
          </Tooltip>
        </MenuList>
      </CustomPopover>
      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title="Delete"
        content="Are you sure you want to delete this email list?"
        action={
          <Button variant="contained" color="error" onClick={() => handleDelete(rowToDelete)}>
            Delete
          </Button>
        }
      />
      <Snackbar
        open={snackbarState.open}
        autoHideDuration={2500}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{
          boxShadow: '0px 8px 16px 0px rgba(145, 158, 171, 0.16)',
          mt: 8,
          zIndex: theme.zIndex.modal + 9999,
        }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarState.severity}
          sx={{
            width: '100%',
            fontSize: '14px',
            fontWeight: 'bold',
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            '& .MuiAlert-icon': {
              color:
                snackbarState.severity === 'error'
                  ? theme.palette.error.main
                  : theme.palette.success.main,
            },
          }}
        >
          {snackbarState.message}
        </Alert>
      </Snackbar>
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

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (order) =>
        order.name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        (order.email && order.email.toLowerCase().indexOf(name.toLowerCase()) !== -1) // Ensure email exists
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((order) => order.status === status);
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter((order) => fIsBetween(order.createdAt, startDate, endDate));
    }
  }

  return inputData;
}