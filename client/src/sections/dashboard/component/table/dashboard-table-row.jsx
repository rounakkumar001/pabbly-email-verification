import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { Box, Tooltip, IconButton, Typography } from '@mui/material';

import axiosInstance, { endpoints } from 'src/utils/axios';

import { completeVerification, startEmailVerification } from 'src/redux/slice/upload-slice';
import { setSelectedListName, fetchEmailVerificationResults } from 'src/redux/slice/email-verification-slice';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { usePopover } from 'src/components/custom-popover';


// ----------------------------------------------------------------------

export function DashboardTableRow({
  row,
  selected,
  dashboardTableIndex,
  onOpenPopover,
  onViewReport,
  onStartVerification,
  isProcessing,
  isCompleted,
}) {
  const csvfilesname = [{ name: row.name, numberOfEmails: row.numberOfEmails }];
  const timezone = '(UTC+05:30) Asia/Kolkata';

  // Get the current file details based on the index
  const currentFile = csvfilesname[dashboardTableIndex % csvfilesname.length];
  const navigate = useNavigate();
  const popover = usePopover();
  const handleViewReport = () => {
    const listName = csvfilesname[dashboardTableIndex % csvfilesname.length];
    dispatch(setSelectedListName(currentFile.name));
    navigate('/app/reports');
  };
  const handelNavigate = () => {
    navigate('/app/reports');
  };

  const dispatch = useDispatch();

  const checkVerificationStatus = async (jobId) => {
    try {
      const response = await axiosInstance.get(`${endpoints.bouncify.checkBulkEmailVerificationStatus}?job_id=${jobId}`);

      const { data: { data: { status } } } = response;

      let timeoutId;
      if (status === 'verifying' || status === 'ready') {
        timeoutId = setTimeout(() => checkVerificationStatus(jobId), 3000); // Call itself again after 3 seconds
      } else if (status === 'completed') {
        clearTimeout(timeoutId);
        dispatch(fetchEmailVerificationResults());
        dispatch(completeVerification())
      } else {
        console.log("Verification finished with status:", status); // Log other statuses
      }

    } catch (error) {
      console.error("Error checking verification status:", error);
    }
  };

  const handleStartVerification = () => {

    dispatch(startEmailVerification(row.jobId))
      .unwrap()
      .then(() => dispatch(fetchEmailVerificationResults()))
      .catch((error) => {
        console.error("Upload failed:", error);
      });
    checkVerificationStatus(row.jobId)
  };


  const handleDownload = async () => {
    const { name, jobId } = row;

    try {
      const response = await axiosInstance.post(
        `${endpoints.bouncify.downloadCSV}`,
        { jobId }, // The request body
        {
          responseType: 'blob', // Crucial for downloading files
        }
      );

      // Create a Blob URL
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' }); // Use content-type from response or default

      const url = window.URL.createObjectURL(blob);

      // Create and trigger the download link
      const link = document.createElement('a');
      link.href = url;

      // Extract filename from Content-Disposition header or use a default
      let filename = `${name}`; // Default filename
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const filenameMatch1 = contentDisposition.match(/filename="([^"]+)"/);
        if (filenameMatch1) {
          filename = filenameMatch1[1];
        } else {
          const filenameMatch = contentDisposition.match(/filename\*=UTF-8''([^"]+)/);
          if (filenameMatch) {
            filename = decodeURIComponent(filenameMatch[1]);
          }
        }
      }
      link.setAttribute('download', filename); // Set filename

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the Blob URL
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error downloading:", error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
        alert(`Download failed: ${error.response.status} - ${error.response.data.message || "An error occurred."}`); // Improved alert message
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.error("Request:", error.request);
        alert("Download failed: No response from the server.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
        alert(`Download failed: ${error.message}`);
      }
    }
  };


  const renderPrimary = (
    <TableRow hover selected={selected}>
      <TableCell width={300}>
        <Stack
          spacing={2}
          direction="row"
          alignItems="center"
          sx={{
            typography: 'body2',
            flex: '1 1 auto',
            alignItems: 'flex-start',
          }}
        >
          <Tooltip
            title={`${(row.status === 'UNPROCESSED' && 'List is Unprocessed.') ||
              (row.status === 'VERIFIED_LIST' && 'List is Completed.') ||
              (row.status === 'PROCESSING' && 'List is Processing.')
              }`}
            arrow
            placement="top"
            disableInteractive
          >
            <Label
              variant="soft"
              color={
                (row.status === 'UNPROCESSED' && 'error') ||
                (row.status === 'VERIFIED_LIST' && 'success') ||
                (row.status === 'PROCESSING' && 'info') ||
                'default'
              }
            >
              {row.status === "VERIFIED_LIST" ? "Completed" : row.status === "UNPROCESSED" ? "Unprocessed" : row.status === "PROCESSING" ? "Processing" : row.status}
            </Label>
          </Tooltip>
        </Stack>
        <Stack spacing={2} direction="row" alignItems="center">
          <Tooltip
            title={
              <>
                List Name: {currentFile.name} ({currentFile.numberOfEmails})
              </>
            }
            arrow
            placement="top"
            disableInteractive
          >
            <Typography
              component="span"
              fontSize={14}
              sx={{
                mt: '4px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '300px',
              }}
            >
              {currentFile.name} ({currentFile.numberOfEmails}){/* {commonIcon} */}
            </Typography>
          </Tooltip>
        </Stack>
        <Stack spacing={2} direction="row" alignItems="center">
          <Tooltip
            arrow
            placement="top"
            disableInteractive
            title={`List Uploaded: ${row.date}, ${timezone}`}
          >
            <Box
              component="span"
              sx={{
                color: 'text.secondary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '300px',
                display: 'inline-block',
              }}
            >
              {row.date}
            </Box>
          </Tooltip>
        </Stack>
      </TableCell>

      <TableCell width={200}>
        <Tooltip
          title={
            row.status === 'PROCESSING'
              ? 'Verification in progress. Please wait.'
              : row.status === 'VERIFIED_LIST'
                ? 'Click to download list'
                : 'Click to start verification on list'
          }
          arrow
          placement="top"
          disableInteractive
        >
          <span>
            <Button
              variant="outlined"
              color="primary"
              disabled={row.status === 'PROCESSING'}
              onClick={
                row.status === 'PROCESSING' || row.status === 'VERIFIED_LIST'
                  ? handleDownload
                  : handleStartVerification
              }
            >
              {
                row.status === 'PROCESSING' ? 'Verification In Progress' : row.status === 'VERIFIED_LIST' ? 'Download' : 'Start Verification'
              }
            </Button>
          </span>
        </Tooltip>
      </TableCell>

      <TableCell width={140} align="right">
        <Tooltip
          title={
            row.status === 'VERIFIED_LIST'
              ? 'Click to view report of list.'
              : 'Verification in progress. Please wait.'
          }
          arrow
          placement="top"
          disableInteractive
        >
          <span>
            <Button
              variant="outlined"
              color="success"
              disabled={row.status === 'UNPROCESSED' || row.status === 'PROCESSING'}
              onClick={handleViewReport}
            >
              View Report
            </Button>
          </span>
        </Tooltip>
      </TableCell>
      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <Tooltip title="Click for more options." arrow placement="top">
          <IconButton
            color={popover.open ? 'inherit' : 'default'}
            onClick={(event) => onOpenPopover(event)}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );

  return <>{renderPrimary}</>;
}
