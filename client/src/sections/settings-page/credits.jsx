import { useEffect } from 'react';
import { useTheme } from '@emotion/react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';

import { Box, useMediaQuery } from '@mui/material';

import { fetchUserCredits } from 'src/redux/slice/userSlice';

import StatsCards from 'src/components/stats-card/stats-card';

import { CreditTable } from 'src/sections/dashboard/component/table/credit-table';

// ----------------------------------------------------------------------

const metadata = { title: `Pabbly Email Verification | Credits ` };

export default function ThreePage() {

  const dispatch = useDispatch();

  const { credits, isLoading } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUserCredits());
  }, [dispatch])

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>
      {/* <DashboardContent maxWidth="xl"> */}

      <Box
        width="100%"
        sx={{
          mt: '40px',
          mb: '24px',
          gap: 3,
          display: 'grid',
          flexWrap: 'wrap',
          gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' },
        }}
      >
        <StatsCards
          cardtitle="Email Credits Allotted"
          cardstats={credits.allotted}
          icon_name="2card.png"
          icon_color="#FFA92E"
          bg_gradient="#FFA92E"
          tooltipTittle="Number of credits alloted to your account."
        />
        <StatsCards
          cardtitle="Email Credits Consumed"
          cardstats={credits.consumed}
          icon_name="Processed.svg"
          icon_color="#10CBF3"
          bg_gradient="#10CBF3"
          tooltipTittle="Number of credits consumed by your account."
        />
        <StatsCards
          cardtitle="Email Credits Remaining"
          cardstats={credits.remaining}
          icon_name="Complete.svg"
          icon_color="#1D88FA"
          bg_gradient="#1D88FA"
          tooltipTittle="Number of credits remaining to your account."
        />
      </Box>
      <CreditTable />
    </>
  );
}
