import { Helmet } from 'react-helmet-async';

import { Box, Button, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { JwtSignInView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

const metadata = { title: `Sign in | Pabbly Email Verification ` };

export default function Page() {
  const router = useRouter();

  const redirectToLogin = () => { 
    router.push(paths.auth.jwt.signUp);
  };

  return (
    <>
      <Box
        sx={{
          position: { xs: 'relative', md: 'absolute' }, // Relative for mobile/tablet, absolute for laptop
          top: { xs: -32, md: 16 }, // Top positioning only for laptop
          right: { xs: 'auto', md: 16 }, // Right positioning only for laptop
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' }, // Column on mobile/tablet, row on laptop
          alignItems: 'center',
          justifyContent: { xs: 'center', md: 'flex-start' }, // Center for mobile/tablet, left-align for laptop
          padding: { xs: 2, md: 0 }, // Padding for mobile/tablet
          gap: { xs: 1, md: 0 }, // Gap for mobile/tablet
          width: { xs: '100%', md: 'auto' }, // Full width on mobile/tablet
        }}
      >
        <Box
          component="svg"
          width="511"
          height="145"
          viewBox="0 0 511 145"
          textAlign="center"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          sx={{
            display: { xs: 'block', md: 'none' }, // Show only on mobile and tablet
            width: '150px',
            height: '42.65px',
          }}
        >
          <path
            d="M133.903 66.762C133.903 103.635 103.927 133.524 66.9516 133.524C55.3582 133.524 44.4531 130.587 34.9447 125.416C14.1255 114.095 0 92.074 0 66.762C0 29.8908 29.9752 0 66.951 0C103.927 0 133.903 29.8908 133.903 66.762Z"
            fill="#20B276"
          />
          <path
            d="M93.6733 85.751C86.5889 93.0312 77.9913 96.6739 67.8826 96.6739C61.713 96.6739 55.9808 95.6325 50.6071 92.6075L50.5424 131.374L50.0332 131.237L49.7181 131.156L49.346 130.955L49.1706 130.638L49.0091 130.281L49.1882 130.057L31.4604 108.979L31.4656 59.153C31.4656 48.7709 35.0073 39.9534 42.0923 32.699C49.1757 25.4441 57.7728 21.8174 67.8826 21.8174C77.9913 21.8174 86.5884 25.457 93.6733 32.7387C100.757 40.0195 104.3 48.8555 104.3 59.2454C104.3 69.6362 100.757 78.4707 93.6733 85.751ZM80.1507 46.6257C76.787 43.1657 72.6978 41.4365 67.8826 41.4365C63.0663 41.4365 58.977 43.1657 55.6144 46.6257C52.2507 50.0857 50.5688 54.2914 50.5688 59.2464C50.5688 64.1998 52.2502 68.4055 55.6144 71.8655C58.977 75.326 63.0663 77.0563 67.8826 77.0563C72.6978 77.0563 76.787 75.326 80.1507 71.8655C83.5139 68.4055 85.1958 64.1998 85.1958 59.2464C85.1958 54.2914 83.5139 50.0852 80.1507 46.6257Z"
            fill="#147F52"
          />
          <path
            d="M92.2799 84.3747C85.1954 91.6559 76.5989 95.2976 66.4897 95.2976C60.3201 95.2976 54.5496 93.7851 49.1765 90.7601L49.1708 131.145C49.1708 131.145 47.8631 130.786 46.161 130.238C45.7413 130.103 45.3175 129.958 44.8735 129.802C44.6624 129.727 44.5594 129.683 44.342 129.621C43.7852 129.461 43.0794 129.152 42.5355 128.941C40.7077 128.231 39.2266 127.555 39.1909 127.538C39.1552 127.521 33.9234 125.033 33.3334 124.665C32.8051 124.336 32.3347 124.078 31.9316 123.789C31.8027 123.698 31.7054 123.632 31.5833 123.548C30.6249 122.891 30.0893 122.514 30.0893 122.514L30.0732 57.7777C30.0732 47.3951 33.615 38.5777 40.6999 31.3238C47.7839 24.0683 56.3805 20.4421 66.4902 20.4421C76.5994 20.4421 85.196 24.0817 92.2804 31.3635C99.3644 38.6442 102.908 47.4803 102.908 57.8696C102.907 68.2594 99.3639 77.0939 92.2799 84.3747ZM78.7578 45.2495C75.3936 41.7894 71.3049 40.0602 66.4892 40.0602C61.6729 40.0602 57.5836 41.7894 54.221 45.2495C50.8573 48.7095 49.1759 52.9152 49.1759 57.8696C49.1759 62.8235 50.8573 67.0292 54.221 70.4887C57.5836 73.9503 61.6729 75.68 66.4892 75.68C71.3044 75.68 75.3936 73.9503 78.7578 70.4887C82.1205 67.0292 83.8029 62.8235 83.8029 57.8696C83.8029 52.9152 82.1205 48.7095 78.7578 45.2495Z"
            fill="white"
          />
          <path
            d="M150.69 111.452V25.2583C150.69 23.9837 151.175 22.8629 152.145 21.8953C153.113 20.9283 154.236 20.4442 155.515 20.4442H179.505C187.479 20.4442 194.276 23.2494 199.893 28.8571C205.51 34.4649 208.319 41.2497 208.319 49.2105C208.319 57.1281 205.506 63.9015 199.882 69.532C194.256 75.1624 187.451 77.9764 179.466 77.9764H165.038C161.862 77.9764 160.273 76.3736 160.273 73.1659V111.455C160.273 114.663 158.676 116.266 155.482 116.266C152.287 116.266 150.69 114.662 150.69 111.452ZM160.273 73.1664C160.273 70.0031 161.862 68.4215 165.04 68.4215H179.472C184.767 68.4215 189.303 66.5483 193.076 62.8013C196.85 59.0539 198.737 54.5345 198.737 49.2441C198.737 43.9547 196.85 39.425 193.076 35.6548C189.303 31.8862 184.767 30.0007 179.472 30.0007H160.273V73.1664Z"
            fill="#3B3938"
          />
          <path
            d="M262.84 111.45C262.84 114.661 261.232 116.266 258.016 116.266C254.8 116.266 253.214 114.663 253.258 111.455C248.984 114.663 244.181 116.266 238.851 116.266C232.242 116.266 226.58 113.927 221.866 109.248C217.151 104.569 214.794 98.9336 214.794 92.3433C214.794 85.7531 217.151 80.1082 221.866 75.4066C226.58 70.706 232.242 68.355 238.851 68.355C244.181 68.355 248.984 69.9593 253.258 73.166C253.258 69.1946 251.847 65.7965 249.029 62.9707C246.208 60.1459 242.816 58.7335 238.851 58.7335C236.075 58.7335 233.288 59.7006 230.491 61.6331C227.692 63.5672 225.964 64.5332 225.303 64.5332C223.981 64.5332 222.825 64.0368 221.833 63.0439C220.842 62.0516 220.346 60.8931 220.346 59.569C220.346 58.5106 220.852 57.3861 221.866 56.1936C225.788 51.5168 231.449 49.1781 238.851 49.1781C245.46 49.1781 251.11 51.5209 255.803 56.2039C260.495 60.8874 262.841 66.5277 262.841 73.1247V111.45H262.84ZM253.258 92.3108C253.258 88.3482 251.844 84.9573 249.018 82.1388C246.192 79.3207 242.791 77.9109 238.818 77.9109C234.843 77.9109 231.443 79.3207 228.617 82.1388C225.791 84.9573 224.378 88.3482 224.378 92.3108C224.378 96.274 225.791 99.6648 228.617 102.483C231.443 105.301 234.844 106.71 238.818 106.71C242.791 106.71 246.192 105.301 249.018 102.483C251.844 99.6648 253.258 96.274 253.258 92.3108Z"
            fill="#3B3938"
          />
          <path
            d="M342.806 82.6893C342.806 91.9687 339.524 99.8841 332.959 106.438C326.393 112.991 318.463 116.267 309.167 116.267C299.915 116.267 292.006 112.992 285.441 106.441C278.876 99.8903 275.594 91.9769 275.594 82.6996V25.2583C275.594 22.0496 277.202 20.4442 280.419 20.4442C283.591 20.4442 285.177 22.0506 285.177 25.2635V59.2608C291.786 52.539 299.782 49.1775 309.167 49.1775C318.463 49.1775 326.393 52.4543 332.959 59.007C339.524 65.5606 342.806 73.4544 342.806 82.6893ZM333.223 82.6893C333.223 76.1341 330.865 70.5037 326.152 65.7954C321.437 61.0876 315.776 58.7335 309.167 58.7335C302.602 58.7335 296.963 61.0876 292.249 65.7954C287.534 70.5037 285.177 76.1341 285.177 82.6893C285.177 89.2884 287.534 94.9415 292.249 99.6498C296.963 104.358 302.602 106.711 309.167 106.711C315.776 106.711 321.437 104.358 326.152 99.6498C330.865 94.9415 333.223 89.2884 333.223 82.6893Z"
            fill="#3B3938"
          />
          <path
            d="M419.667 82.6893C419.667 91.9687 416.384 99.8841 409.82 106.438C403.254 112.991 395.324 116.267 386.028 116.267C376.776 116.267 368.867 112.992 362.302 106.441C355.737 99.8903 352.455 91.9769 352.455 82.6996V25.2583C352.455 22.0496 354.063 20.4442 357.28 20.4442C360.452 20.4442 362.037 22.0506 362.037 25.2635V59.2608C368.646 52.539 376.643 49.1775 386.027 49.1775C395.324 49.1775 403.254 52.4543 409.82 59.007C416.384 65.5606 419.667 73.4544 419.667 82.6893ZM410.084 82.6893C410.084 76.1341 407.726 70.5037 403.012 65.7954C398.298 61.0876 392.637 58.7335 386.028 58.7335C379.462 58.7335 373.823 61.0876 369.11 65.7954C364.395 70.5037 362.038 76.1341 362.038 82.6893C362.038 89.2884 364.395 94.9415 369.11 99.6498C373.823 104.358 379.463 106.711 386.028 106.711C392.637 106.711 398.298 104.358 403.012 99.6498C407.727 94.9415 410.084 89.2884 410.084 82.6893Z"
            fill="#3B3938"
          />
          <path
            d="M453.306 111.455C453.306 114.663 451.697 116.266 448.482 116.266C443.237 116.266 438.733 114.387 434.966 110.627C431.2 106.869 429.316 102.351 429.316 97.0748V25.2583C429.316 22.0496 430.924 20.4442 434.14 20.4442C437.313 20.4442 438.898 22.0496 438.898 25.2593V97.0815C438.898 99.7195 439.845 101.984 441.74 103.875C443.634 105.765 445.881 106.711 448.481 106.711C451.697 106.711 453.306 108.292 453.306 111.455Z"
            fill="#3B3938"
          />
          <path
            d="M511 121.061C511 127.612 508.654 133.239 503.961 137.944C499.269 142.646 493.618 145 487.009 145C482.867 145 478.881 143.922 475.048 141.771C471.082 139.573 468.151 136.696 466.258 133.137C465.773 132.17 465.531 131.314 465.531 130.568C465.531 129.292 466.048 128.184 467.084 127.24C468.119 126.294 469.275 125.823 470.554 125.823C471.654 125.823 473.648 127.426 476.535 130.634C479.42 133.84 482.912 135.444 487.01 135.444C490.975 135.444 494.368 134.037 497.187 131.227C500.006 128.414 501.417 125.032 501.417 121.078V111.456C497.143 114.664 492.341 116.267 487.01 116.267C480.401 116.267 474.751 113.925 470.058 109.242C465.365 104.559 463.02 98.9181 463.02 92.3206V53.9287C463.02 50.7623 464.627 49.1786 467.844 49.1786C471.016 49.1786 472.602 50.7623 472.602 53.9287V92.3278C472.602 96.2874 474.012 99.6741 476.832 102.489C479.651 105.305 483.044 106.711 487.009 106.711C490.974 106.711 494.367 105.305 497.187 102.489C500.006 99.6741 501.417 96.2868 501.417 92.3278V53.9287C501.417 50.7623 503.024 49.1786 506.241 49.1786C509.413 49.1786 510.999 50.7613 510.999 53.9266V121.061H511Z"
            fill="#3B3938"
          />
        </Box>

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
          onClick={redirectToLogin}
          sx={{ border: 'solid 1px ' }}
        >
          Create Account
        </Button>
      </Box>

      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <JwtSignInView />
    </>
  );
}
