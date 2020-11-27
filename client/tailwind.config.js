module.exports = {
  // Adding a prefix so its clear where we are overriding styles 
  prefix: 'tw-',
  theme: {
    extend: {
      fontFamily: {
        'main': ["Helvetica Neue", "Arial", "Helvetica", "Geneva", "sans-serif"],
        'page-header': ["Maven Pro"],
        'content-header': ['Droid Sans'],
        'icon': ['FontAwesome'],
        'fixed': ["Courier"],
        },
        /* Add a tiny font size for breadcrumbs etc. */
      fontSize: {
        'xxs': '0.65rem',
        // These are the defaults
        //   'xs': '.75rem',
        //   'sm': '.875rem',
        //   'base': '1rem',
        //   'lg': '1.125rem',
        //   'xl': '1.25rem',
        //   '2xl': '1.5rem',
        //   '3xl': '1.875rem',
        //   '4xl': '2.25rem',
        //   '5xl': '3rem',
        //   '6xl': '4rem',
        },
      backgroundImage: {
        'header-site-logo': "url('~images/diamond_gs_small.png')",
        'footer-site-logo': "url('~images/ispyb_gs_medium.png')",
      },
      colors: {
        'link-color': '#666666',
        'link-hover-color': '#222222',
//Sidebar
        'sidebar-grad-start': 'rgb(247,247,247)',
        'sidebar-grad-end': 'rgb(240,240,240)',
        'sidebar-border': '#e2e2e2',
        'sidebar-hover-background': '#f9f9f9',
        'sidebar-hover-dark-background': '#ededed',
        'sidebar-mobile-color': '#ffffff',
        'sidebar-mobile-background': 'rgb(92,92,92)',
        'sidebar-mobile-border-top': '#3e3e3e',
        'sidebar-mobile-border-bottom': '#717171',
        'sidebar-mobile-active-background': 'rgb(115,115,115)',
        'sidebar-mobile-hover-background': 'rgb(105,105,105)',
// Header
        'header-background': '#2c2c2c',
        'header-color': '#666666',
        'header-hover-color': '#cdcdcd',
// Header Menu
        'header-menu-color': '#dddddd',
        'header-menu-hover': '#ffffff',
// Header Breadcrumbs
        'header-bc-background': '#474747',
        'header-bc-color': '#dbdbdb',
        'header-bc-hover': '#ffffff',
// Footer
        'footer-background': '#000000',
        'footer-color': '#efefef',
        'footer-hover-color': '#efefef',
// Content
        'content-background': '#f4f4f4',
        'content-border': '#e2e2e2',
        'content-fill-color': '#efefef',
        'content-header-color': '#000000',
        'content-search-background': '#cdcdcd',
        'content-highlight': '#ffffff',
        'content-page-background': '#ededed',
        'content-page-selected-background': '#cdcdcd',
        'content-page-color': '#666666', // Same as link-color
        'content-page-hover-color': '#222222', // Same as link-hover-color
        'content-main-background': '#efefef',
        'content-sub-header-background': '#afafaf',
        'content-sub-header-hover-background': '#cdcdcd',
        'content-sub-background': '#ffffff',
        'content-sub-hover-background': '#fbfbfb',
        'content-inlay-background': '#dadada',
        'content-filter-background': '#dfdfdf',
        'content-filter-current-background': '#efefef',
        'content-filter-color': '#000000',
        'content-active': '#82d180',
        'content-inactive': '#f26c4f',
        'content-minor': 'yellow',
        'content-light-background': '#ebebeb',
        'content-dark-background': '#dedede',
        'content-cal-header-background': '#cecece',
        'content-cal-background': '#eeeeee',
        'content-cal-hl1-background': '#dfdfdf',
        'content-cal-hl2-background': '#f3f3f3',
        'content-help-background': '#000000',
        'content-help-color': '#e2e2e2',
// Tables
        'table-header-color': '#f1f1f1',
        'table-header-background': '#474747',
        'table-body-background': '#f1f1f1',
        'table-body-background-odd': '#ebebeb',
        'table-row-hover-background': '#dedede',
        'table-footer-background': '#dfdfdf',
        'table-pages-color': '#efefef',
        'table-pages-active-color': '#474747', // Same as table-page-background',
        'table-pages-disable-color': '#ababab',
// Plot
        'plot-legend-background': '#dddddd',
      }
    }
  },
  plugins: []
}
