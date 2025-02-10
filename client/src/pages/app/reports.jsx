import { useTheme } from '@emotion/react';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';

import {
  Box,
  Card,
  Dialog,
  Button,
  Tooltip,
  Divider,
  CardHeader,
  IconButton,
  Typography,
  DialogTitle,
  useMediaQuery,
  DialogActions,
} from '@mui/material';

import axiosInstance, { endpoints } from 'src/utils/axios';

import { DashboardContent } from 'src/layouts/dashboard';
import { listItems } from 'src/_mock/big-card/_reportsBigCardListItems';
import { fetchEmailVerificationResults } from 'src/redux/slice/emailVerificationSlice';

import { Iconify } from 'src/components/iconify';
import BigCard from 'src/components/big-card/big-card';
import StatsCards from 'src/components/stats-card/stats-card';
import PageHeader from 'src/components/page-header/page-header';

import { ReportsBarChart } from 'src/sections/reports/component/chart-view/reports-bar-chart';

// ----------------------------------------------------------------------

const metadata = { title: `Reports | Pabbly Email Verification` };
const { items, style } = listItems;

export default function Page() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { selectedListName, filteredCSVLogs } = useSelector((state) => state.emailVerificationLogs);
  const [selectedOption, setSelectedOption] = useState('all-result');
  const dispatch = useDispatch();


  useEffect(() => {
    dispatch(fetchEmailVerificationResults());
  }, [dispatch])

  const { verificationResults } = useSelector((state) => state.emailVerificationLogs);
  const csvEntries = verificationResults.filter(entry => entry.source_name === selectedListName);

  const { totalEmails, deliverable, undeliverable, unknown, acceptAll } = csvEntries.reduce((acc, entry) => {
    acc.totalEmails += entry.total_emails;
    acc.deliverable += entry.deliverable;
    acc.undeliverable += entry.undeliverable;
    acc.unknown += entry.unknown;
    acc.acceptAll += entry.accept_all;
    return acc;
  }, {
    totalEmails: 0,
    deliverable: 0,
    undeliverable: 0,
    unknown: 0,
    acceptAll: 0
  });

  const downloadActions = [
    {
      id: 'all-results',
      itemName: 'All Result',
      itemIcon: 'material-symbols:check-circle',
      selected: true,
    },
    {
      id: 'deliverable',
      itemName: 'Deliverable',
      itemIcon: 'ep:list',
      selected: false,
    },
    {
      id: 'undeliverable',
      itemName: 'Undeliverable',
      itemIcon: 'gridicons:cross-circle',
      selected: false,
    },
  ];

  const [dialog, setDialog] = useState({
    open: false,
    mode: '',
  });

  const handleOpen = (mode) => {
    setDialog({ open: true, mode });
    setSelectedOption('all-results');
  };

  const handleClose = () => {
    setDialog({ open: false, mode: '' });
  };

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
  };

  const handleDownload = async () => {

    const data = filteredCSVLogs.filter(item => item.name === selectedListName)[0];
    const { name, jobId } = data;

    try {
      const response = await axiosInstance.post(
        `${endpoints.bouncify.downloadCSV}`,
        { jobId, selectedOption }, 
        {
          responseType: 'blob', 
        }
      );

      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' }); 
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      let filename = `${name}`;
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

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      handleClose();
    } catch (error) {
      console.error("Error downloading:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
        alert(`Download failed: ${error.response.status} - ${error.response.data.message || "An error occurred."}`); 
      } else if (error.request) {
        console.error("Request:", error.request);
        alert("Download failed: No response from the server.");
      } else {
        console.error("Error message:", error.message);
        alert(`Download failed: ${error.message}`);
      }
    }
  };

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>
      <DashboardContent maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            mb: 0,
          }}
        >
          <PageHeader
            title="Reports"
            Subheading="Get a detailed summary of your email verification results to optimize performance."
            link_added="#"
          />
        </Box>
        <Box
          width="100%"
          sx={{
            mt: '40px',
            mb: '24px',
            gap: 3,
            display: 'grid',
            flexWrap: 'wrap',
            gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(5, 1fr)' },
          }}
        >
          <StatsCards
            cardtitle="Total Emails"
            cardstats={totalEmails}
            icon_name="Processed.svg"
            icon_color="#7D6ADB"
            bg_gradient="#7D6ADB"
            tooltipTittle="Total number of emails processed in verification."
          />
          <StatsCards
            cardtitle="Deliverable Emails"
            cardstats={deliverable}
            icon_name="2card.png"
            icon_color="#28A645"
            bg_gradient="#28A645"
            tooltipTittle="Total number of emails deliverable in verification."
          />
          <StatsCards
            cardtitle="Undeliverable Emails"
            cardstats={undeliverable}
            icon_name="undeliverable.svg"
            icon_color="#FF5630"
            bg_gradient="#FF5630"
            tooltipTittle="Total number of emails undeliverable in verification."
          />
          <StatsCards
            cardtitle="Accept-all Emails"
            cardstats={acceptAll}
            icon_name="accept-all.svg"
            icon_color="#00B8D9"
            bg_gradient="#00B8D9"
            tooltipTittle="Total number of emails accepted in verification."
          />
          <StatsCards
            cardtitle="Unknown Emails"
            cardstats={unknown}
            icon_name="unknown.svg"
            icon_color="#FFA92E"
            bg_gradient="#FFAB00"
            tooltipTittle="Total number of emails unknown in verification."
          />
        </Box>
        <BigCard
          getHelp={false}
          isVideo={false}
          bigcardtitle="Email List Analysis Report"
          bigcardsubtitle="Get detailed insights about your email list quality with complete verification status breakdown:"
          style={style}
          items={items}
          thumbnailName="Report.png"
        />
        <Card sx={{ mt: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            flexWrap="wrap"
            alignItems="center"
            alignContent="center"
          >
            <CardHeader
              title={
                <Tooltip
                  title="Bar chart showing the distribution of your email verification results"
                  placement="top"
                  arrow
                >
                  <span>
                    {selectedListName
                      ? `Verification Summary - ${selectedListName} `
                      : 'Verification Summary'}
                  </span>
                </Tooltip>
              }
              subheader="Here you can see the verification summary of the list."
            />
            <Box pt={3} px={3}>
              <Tooltip arrow placement="top" disableInteractive title="Click to download report.">
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleOpen('download')}
                  startIcon={<Iconify width={24} icon="solar:download-minimalistic-bold" />}
                >
                  Download Report
                </Button>
              </Tooltip>
            </Box>
          </Box>
          <Divider sx={{ mt: 3 }} />
          <ReportsBarChart
            chart={{
              categories: [
                'Total Emails',
                'Deliverable Emails',
                'Undeliverable Emails',
                'Accept-All Emails',
                'Unknown Emails',
              ],
              series: [{ data: [totalEmails, deliverable, undeliverable, acceptAll, unknown] }],
            }}
          />
        </Card>
      </DashboardContent>

      <Dialog open={dialog.open} onClose={handleClose} maxWidth="sm" fullWidth>
        <Box sx={{ position: 'relative', p: 2 }}>
          {dialog.mode === 'download' && (
            <>
              <DialogTitle sx={{ p: 0, mb: 2 }}>
                <Typography variant="h6">Download Verification Result</Typography>
                <IconButton
                  onClick={handleClose}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: 'text.secondary',
                  }}
                >
                  <Iconify icon="eva:close-fill" />
                </IconButton>
              </DialogTitle>

              <Box sx={{ px: 1 }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 2,
                    mb: 4,
                  }}
                >
                  {downloadActions.map((action) => (
                    <Button
                      key={action.id}
                      onClick={() => handleOptionSelect(action.id)}
                      sx={{
                        height: '150px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        p: 2,
                        border: 2,
                        borderColor: selectedOption === action.id ? 'primary.main' : 'divider',
                        borderRadius: 1,
                        bgcolor:
                          selectedOption === action.id ? 'primary.lighter' : 'background.paper',
                        '&:hover': {
                          borderColor:
                            selectedOption === action.id ? 'primary.main' : 'text.secondary',
                          bgcolor:
                            selectedOption === action.id ? 'primary.lighter' : 'action.hover',
                        },
                      }}
                    >
                      <Iconify
                        icon={action.itemIcon}
                        width={24}
                        sx={{
                          color: selectedOption === action.id ? 'primary.main' : 'text.secondary',
                        }}
                      />

                      <Typography
                        sx={{
                          mt: 1,
                          color: selectedOption === action.id ? 'primary.main' : 'text.secondary',
                          fontWeight: selectedOption === action.id ? 500 : 400,
                        }}
                      >
                        {action.itemName}
                      </Typography>
                    </Button>
                  ))}
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Please note all data and reports associated with this list will be permanently
                  removed automatically after 15 days.
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" onClick={handleDownload} color="primary">
                    Download
                  </Button>
                </Box>
              </Box>
            </>
          )}

          {dialog.mode === 'delete' && (
            <>
              <DialogTitle>
                <Typography variant="body2">
                  The list &quot;Untitled_spreadsheet_-_Sheet1.csv&quot; will be deleted permanently
                  and cannot be recovered back. Do you want to continue?
                </Typography>
              </DialogTitle>
              <DialogActions>
                <Button onClick={handleClose} color="inherit">
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleClose();
                  }}
                  color="error"
                  variant="contained"
                >
                  Delete
                </Button>
              </DialogActions>
            </>
          )}
        </Box>
      </Dialog>
    </>
  );
}
