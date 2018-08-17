import Helmet from 'react-helmet'
import Media from 'react-media'
import Sidebar from './sidebar'

export const TemplateWrapper = ({ children }) => (
    <div>
      <Helmet
        title="Gatsby Default Starter"
        meta={[
          { name: "description", content: "Sample" },
          { name: "keywords", content: "sample, something" }
        ]}
      />
      <Header />
      <div
        style={{
          margin: "0 auto",
          maxWidth: 980,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          height: "100%"
        }}
      >
        <Media query={{ maxWidth: 848 }}>
          {matches =>
            matches ? (
              <div
                style={{
                  margin: "0 auto",
                  maxWidth: 980,
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  height: "100%",
                  padding: "25px"
                }}
              >
                <div style={{ flex: 1 }}>{children()}</div>
              </div>
            ) : (
              <div
                style={{
                  margin: "0 auto",
                  maxWidth: 980,
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  height: "100%",
                  padding: "25px"
                }}
              >
                <div style={{ flex: 2.5, paddingRight: "30px" }}>
                  {children()}
                </div>
              </div>
            )
          }
        </Media>
      </div>
    </div>
  );