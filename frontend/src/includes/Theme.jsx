import { createTheme } from '@mui/material/styles';

// Kaleido theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3942c1',
      contrastText: '#ffffff',
      dark: '#21266f',
    },
    secondary: {
      main: '#999999',
      dark: '#565555',
    },
    faded: {
      main: '#eff0fa',
    },
    background: {
      default: '#f2f2f2',
    },
    border: {
      main: '#cccccc',
    },
    connectPrimary: {
      main: '#ee34a8',
    },
    bodyTitle: {
      main: '#666666',
    },
    status: {
      warning: {
        main: '#fa9a43',
        light: '#fef4ec'
      },
      success: {
        main: '#03cc79',
        light: '#e4f9f1'
      },
      info: {
        main: '#26c1dd',
        light: '#e9f8fb'
      },
    },
  },
  typography: {
    fontFamily: 'Lato,sans-serif',
    formTitle: {
      fontFamily: 'Lato',
      fontWeight: 300,
      fontSize: '32px',
      color: '#000000',
    },
    formSubtitle: {
      fontFamily: 'Lato',
      fontWeight: 300,
      fontSize: '26px',
      color: '#000000',
    },
    bodyCopy: {
      fontFamily: 'Lato',
      fontWeight: 400,
      fontSize: '14px',
      color: '#000000',
    },
    bodyAndTableTitle: {
      fontFamily: 'Lato',
      fontWeight: 400,
      fontSize: '14px',
      textTransform: 'uppercase',
      color: '#666666',
    },
    clickableAction: {
      fontFamily: 'Lato',
      fontWeight: 700,
      fontSize: '14px',
      color: '#3942c1',
    },
    linkText: {
      fontFamily: 'Lato',
      fontWeight: 700,
      fontSize: '14px',
      textDecoration: 'underline',
      color: '#3942c1',
    },
  },
});

export default theme;
