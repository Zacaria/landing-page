require(`dotenv`).config({
  path: `.env`,
})

const shouldAnalyseBundle = process.env.ANALYSE_BUNDLE

module.exports = {
  siteMetadata: {
    // Used for the title template on pages other than the index site
    siteTitle: `Havesomecode`,
    // Default title of the page
    siteTitleAlt: `Havesomecode - Zacaria Chtatar landing page`,
    // Can be used for e.g. JSONLD
    siteHeadline: `Havesomecode - Zacaria Chtatar`,
    // Will be used to generate absolute URLs for og:image etc.
    siteUrl: `https://www.havesomecode.io`,
    // Used for SEO
    siteDescription: `Landing page of Zacaria Chtatar, React and NodeJs developer. Likes to solve problems. Likes to dev. Likes to keep it simple.`,
    // Will be set on the <html /> tag
    siteLanguage: `en`,
    // Used for og:image and must be placed inside the `static` folder
    siteImage: `/banner.jpg`,
    // Twitter Handle
    author: `@ChtatarZacaria`,
  },
  plugins: [
    {
      resolve: `@lekoarts/gatsby-theme-minimal-blog`,
      // See the theme's README for all available options
      options: {
        navigation: [
          {
            title: `Blog`,
            slug: `/blog`,
          },
          {
            title: `About`,
            slug: `/about`,
          },
        ],
        externalLinks: [
          {
            name: `Github`,
            url: `https://github.com/Zacaria`,
          },
          {
            name: `Twitter`,
            url: `https://twitter.com/ChtatarZacaria`,
          },
          {
            name: `LinkedIn`,
            url: `https://www.linkedin.com/in/zacariachtatar`,
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: 'UA-174048607-1',
      },
    },
    `gatsby-plugin-sitemap`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `havesomecode - Zacaria Chtatar`,
        short_name: `havesomecode`,
        description: `Landing page of Zacaria Chtatar, React and NodeJs developer. Likes to solve problems. Likes to dev. Likes to keep it simple.`,
        start_url: `/`,
        background_color: `#fff`,
        theme_color: `#6B46C1`,
        display: `standalone`,
        icons: [
          {
            src: `/android-chrome-192x192.png`,
            sizes: `192x192`,
            type: `image/png`,
          },
          {
            src: `/android-chrome-512x512.png`,
            sizes: `512x512`,
            type: `image/png`,
          },
        ],
      },
    },
    `gatsby-plugin-offline`,
    shouldAnalyseBundle && {
      resolve: `gatsby-plugin-webpack-bundle-analyser-v2`,
      options: {
        analyzerMode: `static`,
        reportFilename: `_bundle.html`,
        openAnalyzer: false,
      },
    },
  ].filter(Boolean),
}
