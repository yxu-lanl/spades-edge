const fs = require('fs')
const ejs = require('ejs')
const path = require('path')
const Papa = require('papaparse')
const config = require('../config')
const workflowConfig = require('./config')

const localWorkflows = ['taxonomy']
const cromwellWorkflows = []
const nextflowWorkflows = ['sra2fastq']
const nextflowConfigs = {
  profiles: 'common/profiles.nf',
  nf_reports: 'common/nf_reports.tmpl',
}

const workflowList = {
  sra2fastq: {
    outdir: 'output/sra2fastq',
    nextflow_main: 'sra2fastq/nextflow/main.nf -profile local',
    config_tmpl: 'sra2fastq/workflow_config.tmpl',
  },
  taxonomy: {
    outdir: 'output/Taxonomy',
    cmd_template:
      '<%= exec %> --input <%= input %> --outdir <%= outdir %> --prefix <%= prefix %> --db-path <%= dbPath %> --cpu <%= cpu %>  --spades-data <%= spadesData %>',
    cmd_values: {
      exec: process.env.TAXONOMY_EXEC || '/opt/taxonomy/taxonomy_classify',
      cpu: process.env.TAXONOMY_CPU || '1',
      spadesData:
        process.env.TAXONOMY_SPADES_DATA ||
        path.join(workflowConfig.DATA_DIR, 'spades_data'),
      dbPath:
        process.env.TAXONOMY_DB_PATH ||
        path.join(workflowConfig.DATA_DIR, 'taxonomy_db'),
    },
  },
}

// eslint-disable-next-line no-unused-vars
const generateNextflowWorkflowParams = (projectConf, projHome) => {
  const params = {}
  if (projectConf.workflow.name === 'sra2fastq') {
    // download sra data to shared directory
    params.sraOutdir = config.IO.SRA_BASE_DIR
  }
  return params
}

const generateWorkflowResult = proj => {
  const projHome = `${config.IO.PROJECT_BASE_DIR}/${proj.code}`
  const resultJson = `${projHome}/result.json`

  if (!fs.existsSync(resultJson)) {
    const result = {}
    const projectConf = JSON.parse(fs.readFileSync(`${projHome}/conf.json`))
    const outdir = `${projHome}/${workflowList[projectConf.workflow.name].outdir}`

    if (projectConf.workflow.name === 'sra2fastq') {
      // use relative path
      const { accessions } = projectConf.workflow.input
      accessions.forEach(accession => {
        // link sra downloads to project output
        fs.symlinkSync(`../../../../sra/${accession}`, `${outdir}/${accession}`)
      })
    }
    if (projectConf.workflow.name === 'taxonomy') {
      result['Result Summary'] = fs
        .readFileSync(`${outdir}/${proj.name}.pathogen.summary.txt`)
        .toString()
      result['Pathogen-annotated hits'] = Papa.parse(
        fs.readFileSync(`${outdir}/${proj.name}.pathogen.tsv`).toString(),
        { delimiter: '\t', header: true, skipEmptyLines: true },
      ).data
      if (fs.existsSync(`${outdir}/${proj.name}.krona.html`)) {
        result['Krona plot'] =
          `${workflowList[projectConf.workflow.name].outdir}/${proj.name}.krona.html`
      }
      result['Coverage browser'] =
        `${workflowList[projectConf.workflow.name].outdir}/${proj.name}.coverage.html`
      if (fs.existsSync(`${outdir}/${proj.name}.pathogen.full.html`)) {
        result['Pathogen full'] =
          `${workflowList[projectConf.workflow.name].outdir}/${proj.name}.pathogen.full.html`
      }
    }
    fs.writeFileSync(resultJson, JSON.stringify(result))
  }
}

const checkFlagFile = (proj, jobQueue) => {
  const projHome = `${config.IO.PROJECT_BASE_DIR}/${proj.code}`
  const outDir = `${projHome}/${workflowList[proj.type].outdir}`
  if (jobQueue === 'local') {
    const flagFile = `${projHome}/.done`
    if (!fs.existsSync(flagFile)) {
      return false
    }
  }
  // check expected output files
  if (proj.type === 'assayDesign') {
    const outJson = `${outDir}/jbrowse/jbrowse_url.json`
    if (!fs.existsSync(outJson)) {
      return false
    }
  } else if (proj.type === 'taxonomy') {
    const outTsv = `${outDir}/${proj.name}.pathogen.tsv`
    if (!fs.existsSync(outTsv)) {
      return false
    }
  }
  return true
}

const getWorkflowCommand = proj => {
  const projHome = `${config.IO.PROJECT_BASE_DIR}/${proj.code}`
  const projectConf = JSON.parse(fs.readFileSync(`${projHome}/conf.json`))
  const outDir = `${projHome}/${workflowList[projectConf.workflow.name].outdir}`
  const template = workflowList[projectConf.workflow.name].cmd_template

  let command = ''
  if (projectConf.workflow.name === 'taxonomy') {
    const values = {
      input: projectConf.workflow.input.fastqFile,
      outdir: outDir,
      prefix: proj.name,
      exec: process.env.TAXONOMY_EXEC || '/opt/taxonomy/taxonomy_classify',
      cpu: process.env.TAXONOMY_CPU || '1',
      spadesData:
        process.env.TAXONOMY_SPADES_DATA ||
        path.join(workflowConfig.DATA_DIR, 'spades_data'),
      dbPath:
        process.env.TAXONOMY_DB_PATH ||
        path.join(workflowConfig.DATA_DIR, 'taxonomy_db'),
    }
    command = ejs.render(template, values)
    if (projectConf.workflow.input.readType === 'nanopore') {
      command += ' --ont'
    }
  }
  return command
}

module.exports = {
  localWorkflows,
  cromwellWorkflows,
  nextflowWorkflows,
  nextflowConfigs,
  workflowList,
  generateNextflowWorkflowParams,
  generateWorkflowResult,
  checkFlagFile,
  getWorkflowCommand,
}
