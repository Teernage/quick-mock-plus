import ChromeExtension from 'crx'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { generateKeyPairSync } from 'crypto'
import crypto from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const packageJsonPath = path.resolve(__dirname, '..', 'package.json')
const packageJson = await fs.readJson(packageJsonPath)
const projectName = packageJson.name

// 配置参数
const extensionPath = path.resolve(__dirname, '..', 'dist')
const crxFileDir = path.resolve(__dirname, '../CrxFile')
const privateKeyPath = path.resolve(crxFileDir, `${projectName}.pem`)
const outputPath = path.resolve(crxFileDir, `${projectName}.crx`)

const logFilePath = path.join(process.cwd(), 'CrxFile', 'output.log')

// 生成私钥
function generatePrivateKey() {
  console.log('Generating new private key...')

  try {
    // 生成RSA密钥对
    const { privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      },
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      }
    })

    return privateKey
  } catch (err) {
    console.error('Error generating private key:', err)
    throw err
  }
}

async function packageExtension() {
  try {
    // 确保目录存在
    await fs.ensureDir(crxFileDir)

    let privateKey

    // 检查私钥文件是否存在
    if (await fs.pathExists(privateKeyPath)) {
      console.log('Using existing private key...')
      privateKey = await fs.readFile(privateKeyPath, 'utf8')
    } else {
      console.log('Private key not found, generating new one...')
      privateKey = generatePrivateKey()

      // 保存新生成的私钥
      await fs.writeFile(privateKeyPath, privateKey)
      console.log(`Private key saved to: ${privateKeyPath}`)
    }

    // 创建CRX实例
    const crx = new ChromeExtension({
      privateKey: privateKey
    })

    // 检查并删除旧的 CRX 文件
    if (await fs.pathExists(outputPath)) {
      await fs.remove(outputPath)
      console.log(`Removed existing CRX file: ${outputPath}`)
    }

    // 加载扩展
    await crx.load(extensionPath)

    // 打包扩展
    const crxBuffer = await crx.pack()

    const extensionId = crx.generateAppId()
    // 写入新的 CRX 文件
    await fs.writeFile(outputPath, crxBuffer)
    console.log('successfully packaged crx')

    const hash = crypto.createHash('sha256').update(crxBuffer).digest('hex')

    const logContent = [
      `project: ${projectName}`,
      `version: ${packageJson.version}`,
      `ext id: ${extensionId}`,
      `hash: ${hash}`
    ].join('\n')

    await fs.writeFile(logFilePath, logContent)
    console.log('crx log generation successful')
  } catch (err) {
    console.error('Error packaging extension:', err)
  }
}

packageExtension()
