import { Helmet } from 'react-helmet-async';

import { Box, Button, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { JwtConfirm } from 'src/sections/auth/jwt/jwt-change-password';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Confirm Email | {CONFIG.site.name}</title>
      </Helmet>
      <Box
        sx={{
          position: { xs: 'relative', md: 'absolute' }, 
          top: { xs: -32, md: 16 },
          right: { xs: 'auto', md: 16 }, 
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: { xs: 'center', md: 'flex-start' }, 
          padding: { xs: 2, md: 0 },
          gap: { xs: 1, md: 0 },
          width: { xs: '100%', md: 'auto' }, 
        }}
      >
        
        <Box
          component="img"
          src={`${CONFIG.site.basePath}/logo/Pabbly SVG.svg`} // Use the imported SVG
          alt="Logo"
          sx={{
            display: { xs: 'block', md: 'none' },
            width: '150px',
            height: '42.65px',
          }}
        />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            marginRight: { xs: 0, md: 1 }, // Remove margin on mobile
            textAlign: { xs: 'center', md: 'left' }, // Center text on mobile, left-align on desktop
          }}
        >
          Don&apos;t have a Pabbly Account yet?
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          sx={{
            width: { xs: 'auto', md: 'auto' }, // Full width on mobile, auto on desktop
          }}
          href={paths.auth.jwt.signUp}
        >
          Create Account
        </Button>
      </Box>

      <JwtConfirm />
    </>
  );
}
