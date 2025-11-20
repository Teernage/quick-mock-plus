// eslint-disable-next-line @typescript-eslint/no-var-requires
const chalk = require('chalk')

const allowedTypes = [
  'feat',
  'fix',
  'perf',
  'style',
  'docs',
  'test',
  'refactor',
  'build',
  'ci',
  'chore',
  'revert',
  'wip',
  'workflow',
  'types',
  'release',
  'temp'
]

module.exports = (report) => {
  const { valid, errors = [] } = report

  if (valid) {
    return chalk.green('提交信息格式正确！')
  }

  const errorMessages = errors.map((error) => {
    switch (error.name) {
      case 'type-empty':
        return chalk.red('错误: 提交信息必须包含类型（如 feat:）')
      case 'subject-empty':
        return chalk.red('错误: 提交描述不能为空')
      case 'type-enum':
        return chalk.red(`错误: 提交类型必须是以下之一：\n${allowedTypes.join(', ')}`)
      default:
        return chalk.red(`错误: ${error.message}`)
    }
  })

  const output = [
    '',
    ...errorMessages,
    chalk.blue('正确的格式示例：'),
    chalk.green('feat: 添加登录功能'),
    chalk.green('fix: 修复页面加载问题'),
    chalk.green('perf: 提升性能表现'),
    chalk.green('style: 调整代码格式'),
    chalk.green('docs: 更新API文档'),
    chalk.green('test: 增加单元测试'),
    chalk.green('refactor: 重构用户模块'),
    chalk.green('build: 更新构建配置'),
    chalk.green('ci: 修改CI配置'),
    chalk.green('chore: 更新依赖包'),
    chalk.green('revert: 回滚上次提交'),
    chalk.green('wip: 开发中功能'),
    chalk.green('workflow: 更新工作流'),
    chalk.green('types: 修改类型定义'),
    chalk.green('release: 发布新版本'),
    chalk.green('temp: 临时提交'),
    chalk.blue('提交格式示例：feat: 添加新功能'),
    '',
    chalk.yellow('可用的提交类型：'),
    chalk.yellow(allowedTypes.join(', ')),
    '',
    chalk.red('提交信息格式错误！'),
    '',
    chalk.red('特别注意：'),
    chalk.red('1. 冒号后面必须有空格，例如 "feat: " 而不是 "feat:"'),
    chalk.red('2. 冒号必须是英文冒号'),
    chalk.blue('获取更多帮助：https://github.com/conventional-changelog/commitlint/#what-is-commitlint')
  ]

  return output.join('\n')
}
