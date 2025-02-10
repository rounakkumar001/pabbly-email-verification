// ----------------------------------------------------------------------



const ROOTS = {
  AUTH: '/auth',
  app: '/app',
};

// ----------------------------------------------------------------------

export const paths = {
  faqs: '/faqs',
  auth: {
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
      forgotpassword: `${ROOTS.AUTH}/jwt/forgot-password`,
      confirm: `${ROOTS.AUTH}/jwt/confirm`,
    }
  },
  app: {
    root: ROOTS.app,
    reports: `${ROOTS.app}/reports`,
    gethelp: `${ROOTS.app}/gethelp`,
    settings: {
      root: `${ROOTS.app}/settings`,
      credits: `${ROOTS.app}/settings/credits`,
      timezone: `${ROOTS.app}/settings/timezone`,
     
    },
  },
};
