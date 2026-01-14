import React, { useState, useEffect } from 'react'
import { Card, CardBody, Collapse } from 'reactstrap'
import { isValidFileInput } from 'src/edge/common/util'
import { HtmlText } from 'src/edge/common/HtmlText'
import { Header } from 'src/edge/project/forms/SectionHeader'
import { FileInput } from 'src/edge/project/forms/FileInput'
import { OptionSelector } from 'src/edge/project/forms/OptionSelector'
import { workflows } from '../defaults'

export const Taxonomy = (props) => {
  const workflowName = 'taxonomy'
  const [collapseParms, setCollapseParms] = useState(false)
  const [form] = useState({ ...workflows[workflowName] })
  const [validinputs] = useState({ ...workflows[workflowName].validInputs })
  const [doValidation, setDoValidation] = useState(0)

  const toggleParms = () => {
    setCollapseParms(!collapseParms)
  }

  const setOnoff = (onoff) => {
    if (onoff) {
      setCollapseParms(false)
    } else {
      setCollapseParms(true)
    }
    form.paramsOn = onoff
    setDoValidation(doValidation + 1)
  }

  const setOption = (inForm, name) => {
    form.inputs[name].value = inForm.option
    form.inputs[name].display = inForm.display
    setDoValidation(doValidation + 1)
  }

  const setFileInput = (inForm, name) => {
    // console.log('setFileInput:', inForm, name)
    form.inputs[name].value = inForm.fileInput
    form.inputs[name].display = inForm.fileInput_display
    if (validinputs.inputs[name]) {
      validinputs.inputs[name].isValid = inForm.validForm
    }
    setDoValidation(doValidation + 1)
  }

  useEffect(() => {
    form.paramsOn = props.paramsOn ? props.paramsOn : true
  }, [props.paramsOn]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (props.allExpand > 0) {
      setCollapseParms(false)
    }
  }, [props.allExpand])

  useEffect(() => {
    if (props.allClosed > 0) {
      setCollapseParms(true)
    }
  }, [props.allClosed])

  //trigger validation method when input changes
  useEffect(() => {
    // check input errors
    let errors = ''
    Object.keys(validinputs.inputs).forEach((key) => {
      if (!validinputs.inputs[key].isValid) {
        errors += validinputs.inputs[key].error + '<br/>'
      }
    })

    if (errors === '') {
      //files for server to caculate total input size
      let inputFiles = []
      if (form.inputs['fastqFile'].value) {
        inputFiles.push(form.inputs['fastqFile'].value)
      }
      form.files = inputFiles
      form.errMessage = null
      form.validForm = true
    } else {
      form.errMessage = errors
      form.validForm = false
    }
    //force updating parent's inputParams
    props.setParams(form, props.name)
  }, [doValidation]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card className="workflow-card">
      <Header
        toggle={true}
        toggleParms={toggleParms}
        title={props.title}
        collapseParms={collapseParms}
        id={workflowName + 'input'}
        isValid={props.isValid}
        errMessage={props.errMessage}
        onoff={props.onoff}
        paramsOn={form.paramsOn}
        setOnoff={setOnoff}
      />
      <Collapse isOpen={!collapseParms && form.paramsOn} id={'collapseParameters-' + props.name}>
        <CardBody style={props.disabled ? { pointerEvents: 'none', opacity: '0.4' } : {}}>
          {workflows[workflowName].note && (
            <>
              <span className="text-muted edge-text-size-small">
                <HtmlText text={workflows[workflowName].note} />
                <br></br>
                <br></br>
              </span>
            </>
          )}
          <OptionSelector
            name={'readType'}
            setParams={setOption}
            text={workflows[workflowName].inputs['readType'].text}
            tooltip={workflows[workflowName].inputs['readType'].tooltipReads}
            options={workflows[workflowName].inputs['readType'].options}
            defaultValue={form.inputs['readType'].value}
            display={form.inputs['readType'].display}
            tooltipClickable={true}
          />
          <br></br>
          <FileInput
            name={'fastqFile'}
            setParams={setFileInput}
            isValidFileInput={isValidFileInput}
            text={workflows[workflowName].inputs['fastqFile'].text}
            tooltip={workflows[workflowName].inputs['fastqFile'].tooltip}
            enableInput={workflows[workflowName].inputs['fastqFile']['fileInput'].enableInput}
            placeholder={workflows[workflowName].inputs['fastqFile']['fileInput'].placeholder}
            dataSources={workflows[workflowName].inputs['fastqFile']['fileInput'].dataSources}
            fileTypes={workflows[workflowName].inputs['fastqFile']['fileInput'].fileTypes}
            viewFile={workflows[workflowName].inputs['fastqFile']['fileInput'].viewFile}
            isOptional={workflows[workflowName].inputs['fastqFile']['fileInput'].isOptional}
            cleanupInput={workflows[workflowName].inputs['fastqFile']['fileInput'].cleanupInput}
          />
          <br></br>
        </CardBody>
      </Collapse>
    </Card>
  )
}
