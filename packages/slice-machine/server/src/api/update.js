import base64Img from 'base64-img'
import puppeteer from 'puppeteer'
import { fetchStorybookUrl, generatePreview } from './common/utils'
import { createScreenshotUrl } from '../../../lib/utils'
import { getPathToScreenshot } from '../../../lib/queries/screenshot'
import { CustomPaths } from '../../../lib/models/paths'

import { getEnv } from '../../../lib/env'
import mock from '../../../lib/mock'
import { insert as insertMockConfig } from '../../../lib/mock/fs'
import Files from '../../../lib/utils/files'

const testStorybookPreview = async ({ screenshotUrl }) => {
  try {
    console.log('[update]: checking Storybook url')
    await fetchStorybookUrl(screenshotUrl)
  } catch (e) {
    return {
      warning: 'Could not connect to Storybook. Model was saved.'
    }
  }
  return {}
}

const handleStorybookPreview = async ({ screenshotUrl, pathToFile }) => {
  const { warning } = testStorybookPreview({ screenshotUrl })
  if (warning) {
    return warning
  }
  const browser = await puppeteer.launch(({ args: [`--window-size=1200,800`] }))
  const maybeErr = await generatePreview({ browser, screenshotUrl, pathToFile })
  return warning || maybeErr ? 'Model was saved but screenshot could not be generated.' : null
}

 export default async function handler(req) {
    const { env } = await getEnv()
    const { sliceName, from, model, mockConfig } = req.body

    const updatedMockConfig = insertMockConfig(env.cwd, {
      key: sliceName,
      value: mockConfig
    })

    const mockPath = CustomPaths(env.cwd)
      .library(from)
      .slice(sliceName)
      .mocks()
    const modelPath = CustomPaths(env.cwd)
      .library(from)
      .slice(sliceName)
      .model()

    console.log('[update]: generating mocks')

    const mockedSlice = await mock(sliceName, model, updatedMockConfig[sliceName])

    Files.writeJson(modelPath, model)
    Files.writeJson(mockPath, mockedSlice)
    
    
    console.log('[update]: generating screenshots previews')
    // since we iterate over variation and execute async code, we need a regular `for` loop to make sure that it's done sequentially and wait for the promise before running the next iteration
    // no, even foreach doesn't do the trick ;)

    let errors = []
    let previewUrls = {}

    for(let i = 0; i < model.variations.length; i += 1) {
      const variation = model.variations[i]
      const screenshotArgs = {
        cwd: env.cwd,
        from,
        sliceName,
        variationId: variation.id
      }
      const activeScreenshot = getPathToScreenshot(screenshotArgs)
      
      if(!activeScreenshot) {
        const screenshotUrl = createScreenshotUrl({ storybook: env.userConfig.storybook, sliceName, variationId: variation.id })
        const pathToFile = GeneratedPaths(env.cwd)
          .library(screenshotArgs.from)
          .slice(screenshotArgs.sliceName)
          .variation(screenshotArgs.variationId)
          .preview()
        const error = await handleStorybookPreview({ screenshotUrl, pathToFile })
        if(error) {
          console.log(`[update][Slice: ${sliceName}][variation: ${variation.id}]: ${error}`)
          previewUrls[variation.id] = {
            isCustomPreview: false,
            hasPreview: false,
          }
        } else {
          previewUrls[variation.id] = {
            isCustomPreview: false,
            hasPreview: true,
            url: `${env.baseUrl}/api/__preview?q=${encodeURIComponent(pathToFile)}&uniq=${Math.random()}`
          }
        }
      } else {
        previewUrls[variation.id] = {
          isCustomPreview: activeScreenshot.isCustom,
          hasPreview: true,
          url: `${env.baseUrl}/api/__preview?q=${encodeURIComponent(activeScreenshot.path)}&uniq=${Math.random()}`
        }
      }
    }

    console.log('[update]: done!')
    

    return errors.length ? { err: errors, previewUrls } : { previewUrls }
  }