import { Col, Row } from 'reactstrap'

function Home() {
  return (
    <div className="animated fadeIn">
      <Row className="justify-content-center">
        <Col xs="12" sm="12" md="12">
          <div className="clearfix">
            <br></br>
            <div className="edge-text-font edge-text-size-large float-left">
              <a href="https://edgebioinformatics.org/" target="_blank" rel="noreferrer">
                EDGE bioinformatics
              </a>{' '}
              is an is an open-source bioinformatics platform with a user-friendly interface that
              allows scientists to perform a number of bioinformatics analyses using
              state-of-the-art tools and algorithms. SPADES EDGE takes an updated EDGE
              Bioinformatics framework and has only the SPADES Workflow integrated.
            </div>
            <br></br>
            <center></center>
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default Home
