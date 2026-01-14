import { workflowList } from 'src/util'

export const workflowOptions = [{ value: 'taxonomy', label: workflowList['taxonomy'].label }]

export const workflows = {
  taxonomy: {
    validForm: false,
    errMessage: 'input error',
    paramsOn: true,
    files: [],
    note: 'Enter either Illumina data or Oxford Nanopore data in FASTQ format as the input; the file can be compressed. <br/> Acceptable file name extensions: .fastq, .fq, .fastq.gz, .fq.gz',
    inputs: {
      readType: {
        text: 'Read Type',
        tooltip: 'Input raw sequencing reads in FASTQ format.',
        value: 'nanopore',
        display: 'Oxford Nanopore',
        options: [
          { text: 'Illumina', value: 'illumina' },
          { text: 'Oxford Nanopore', value: 'nanopore' },
        ],
      },
      fastqFile: {
        text: 'Input Fastq File',
        value: null,
        display: null,
        fileInput: {
          enableInput: false,
          placeholder: '(Required) Select a file ...',
          dataSources: ['upload', 'public'],
          fileTypes: ['fastq', 'fq', 'fastq.gz', 'fq.gz'],
          projectTypes: [],
          projectScope: ['self+shared'],
          viewFile: false,
          isOptional: false,
          cleanupInput: false,
        },
      },
    },
    // only for input with validation method
    validInputs: {
      inputs: {
        fastqFile: { isValid: false, error: 'Input Fastq File error. Required' },
      },
    },
  },
}
