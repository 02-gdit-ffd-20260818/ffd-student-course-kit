<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { requestGreeting, saveCard } from './services/greetingApi.js'
import { darkThemes, findTheme, lightThemes } from './data/themes.js'
import { composeGreeting } from './shared/greetingTemplates.js'

const OCCASIONS = [
  { id: '生日', icon: '✦' },
  { id: '毕业', icon: '✧' },
  { id: '新年', icon: '❖' },
  { id: '感谢', icon: '❀' },
  { id: '乔迁', icon: '⌂' },
  { id: '通用', icon: '○' },
]
const TONES = ['真诚', '温暖', '活泼', '典雅', '简洁']

const form = reactive({ receiver: '', occasion: '生日', tone: '温暖', details: '' })
const themeId = ref('moon')
const message = ref('')
const status = ref('idle') // idle | loading | ready | error
const source = ref('') // ai | fallback
const reason = ref('')
const shareUrl = ref('')
const sharing = ref(false)
const toast = ref('')

const theme = computed(() => findTheme(themeId.value))
// ============ P4 第1课 任务 TODO 06（中等）：用 computed 控制提交按钮 ============
// 页面上看得到的结果：现在按钮永远是亮的——一个字没填能点，
// 正在生成时还能重复点（点三下就发三次请求）。
// 做完之后：没填称呼时按钮是灰的、点不动；生成中也点不动。
//
// TODO：改成同时满足两个条件才允许提交：
//   form.receiver.trim().length > 0 && status.value !== 'loading'
//
// 为什么用 computed 而不是普通函数：computed **会缓存**，
// 依赖（receiver、status）没变就不重算。模板里用了好几处的值尤其该这么写。
// ======================================================================
const canSubmit = computed(() => true)
const cardFace = computed(() => ({
  background: `linear-gradient(158deg, ${theme.value.colors[0]}, ${theme.value.colors[1]})`,
  color: theme.value.ink,
  // 浅色卡面用深阴影会显脏，分开给
  boxShadow: theme.value.light
    ? '0 22px 44px -26px rgba(40,36,32,.3), 0 1px 3px rgba(40,36,32,.06)'
    : '0 30px 60px -30px rgba(20,16,24,.5), 0 2px 6px rgba(20,16,24,.07)',
  '--glow': theme.value.light ? 'rgba(90,75,60,.07)' : 'rgba(255,255,255,.14)',
}))
const today = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

// 文案一改，之前那条分享链接就不再对应现在的内容了，必须作废，
// 否则用户会把旧链接发出去，收到的是改之前的祝福。
watch(message, () => {
  shareUrl.value = ''
})

function flash(text) {
  toast.value = text
  setTimeout(() => (toast.value = ''), 2400)
}

async function generate() {
  if (!canSubmit.value) return
  status.value = 'loading'
  shareUrl.value = ''
  const seed = Date.now() + Math.floor(Math.random() * 1000)
  try {
    const result = await requestGreeting({ ...form, seed })
    message.value = result.text
    source.value = result.mode
    reason.value = result.reason || ''
    status.value = 'ready'
  } catch {
    // 接口整个不可达（比如纯静态部署、断网）也要出稿。
    // 用户要的是一张贺卡，不是一条报错。
    message.value = composeGreeting(form, seed)
    source.value = 'fallback'
    reason.value = 'offline'
    status.value = 'ready'
  }
}

async function share() {
  if (!message.value || sharing.value) return
  sharing.value = true
  try {
    const { url } = await saveCard({ ...form, message: message.value, themeId: themeId.value })
    shareUrl.value = url
    try {
      await navigator.clipboard.writeText(url)
      flash('链接已复制')
    } catch {
      flash('长按下面的链接复制')
    }
  } catch (error) {
    flash(error.message || '生成链接失败，请重试')
  } finally {
    sharing.value = false
  }
}

async function copyText() {
  try {
    await navigator.clipboard.writeText(message.value)
    flash('文案已复制')
  } catch {
    flash('请手动选中复制')
  }
}

const sourceLabel = computed(() => {
  if (source.value === 'ai') return 'MiniMax-M3 生成'
  if (reason.value === 'no_api_key') return '本地文案库（未配置模型密钥）'
  if (reason.value === 'ai_timeout') return '本地文案库（模型响应超时）'
  if (reason.value === 'offline') return '本地文案库（未连上服务）'
  return '本地文案库'
})

onMounted(() => {
  // 旧版的 #card= 分享链接仍然能用：把它换成新的 /c/ 短链接再跳过去，
  // 已经发出去的旧链接不会失效。
  if (location.hash.startsWith('#card=')) {
    import('./services/share.js').then(async ({ readShareHash }) => {
      const shared = readShareHash(location.hash)
      if (!shared) return
      try {
        const { url } = await saveCard(shared)
        location.replace(url)
      } catch {
        /* 换不了就留在编辑器，不影响使用 */
      }
    })
  }
})
</script>

<template>
  <div class="app">
    <header class="masthead">
      <p class="seal">一笺</p>
      <h1>一笺心意</h1>
      <p class="sub">写一句得体的祝福，生成一张可以直接发出去的贺卡</p>
    </header>

    <main class="layout">
      <section class="panel">
        <form @submit.prevent="generate">
          <fieldset>
            <legend><i>01</i> 场景</legend>
            <div class="grid six">
              <button
                v-for="item in OCCASIONS"
                :key="item.id"
                type="button"
                class="pick"
                                <!-- P4 第1课 任务 TODO 04（简单）：选中状态 -->
                <!-- 页面上看得到的结果：现在点"毕业"以后，六个场景按钮长得一模一样，
                     根本看不出选了哪个。做完之后被选中的那个会高亮。

                     TODO：补上 :aria-pressed="form.occasion === item.id"

                     两个知识点：
                     1) **aria-pressed 是给读屏软件用的**，告诉视障用户"这个按钮是按下的"。
                        样式表里同时写了 .pick[aria-pressed="true"] 的高亮样式——
                        **一个属性同时解决了"看得见"和"听得见"**，比单独加个 class 好。
                     2) 冒号开头的 :aria-pressed 是 v-bind 缩写，值是 JS 表达式；
                        不加冒号就是写死的字符串。
                     ================================================== -->
                @click="form.occasion = item.id"
              >
                              <!-- ====== P4 第1课 任务 TODO 01（极简单）：把图标显示出来 ======
                   页面上看得到的结果：现在六个场景按钮上只有"生日""毕业"几个字，
                   光秃秃的。做完之后每个按钮前面多一个小符号（✦ ✧ ❖ ❀ ⌂ ○）。

                   TODO：在文字前面补一个带 class="glyph" 的 span，里面放 item.icon：
                     <span class="glyph">{{ item.icon }}</span>{{ item.id }}

                   知识点：v-for 遍历的是 OCCASIONS 这个数组，每一项是
                   { id: '生日', icon: '✦' }。**数据和显示是分开的**——
                   想加一个场景，只改上面的数组，模板一个字都不用动。
                   =============================================== -->
              {{ item.id }}
              </button>
            </div>
          </fieldset>

          <fieldset>
            <legend><i>02</i> 语气</legend>
            <div class="grid five">
              <button
                v-for="item in TONES"
                :key="item"
                type="button"
                class="pick slim"
                :aria-pressed="form.tone === item"
                @click="form.tone = item"
              >
                {{ item }}
              </button>
            </div>
          </fieldset>

          <fieldset>
            <legend><i>03</i> 写给谁</legend>
            <input
              v-model="form.receiver"
              maxlength="20"
              placeholder="亲爱的林老师"
              aria-label="收礼人称呼"
            />
            <textarea
              v-model="form.details"
              maxlength="180"
              rows="2"
              placeholder="想提一句的事（可留空）：一起熬过的晚自习…"
              aria-label="补充信息"
            />
                        <!-- ====== P4 第1课 任务 TODO 03（简单）：补充信息的字数提示 ======
                 页面上看得到的结果：现在输入框有 180 字上限，但写到一半
                 突然打不进字了，用户不知道为什么。做完之后下面实时显示
                 "35 / 180"，边打边跳。

                 TODO：补一行 <p class="count">{{ form.details.length }} / 180</p>

                 知识点：**限制要让人看得见**。maxlength 挡住了超长输入，
                 但沉默地挡住等于不告诉用户发生了什么——
                 这是界面设计里很常见的一个疏漏。
                 ==================================================== -->
          </fieldset>

          <fieldset>
            <legend>
              <i>04</i> 卡面
              <!-- 色块本身看不出叫什么名字，把当前这套的名字显示出来 -->
                            <!-- ====== P4 第1课 任务 TODO 02（极简单）：显示当前卡面的名字 ======
                   页面上看得到的结果：现在 13 个色块只有颜色，选了哪个、
                   它叫什么名字完全看不出来。做完之后"卡面"两个字后面会跟着
                   当前这套的名字（比如"月白"），点别的色块名字跟着变。

                   TODO：补一个 <em>{{ theme.name }}</em>

                   知识点：theme 是上面那个 computed，它依赖 themeId。
                   点色块改的是 themeId，theme 自动重算，这里的名字自动更新——
                   **这就是响应式：改数据，不用手动去改页面。**
                   ==================================================== -->
            </legend>
            <div class="swatch-group">
              <p class="swatch-label">浅色</p>
              <div class="swatches">
                <button
                  v-for="item in lightThemes"
                  :key="item.id"
                  type="button"
                  class="swatch is-light"
                  :style="{ background: `linear-gradient(158deg, ${item.colors[0]}, ${item.colors[1]})` }"
                  :aria-pressed="themeId === item.id"
                  :title="item.name"
                  :aria-label="`卡面 ${item.name}`"
                  @click="themeId = item.id"
                />
              </div>
            </div>
            <div class="swatch-group">
              <p class="swatch-label">深色</p>
              <div class="swatches">
                <button
                  v-for="item in darkThemes"
                  :key="item.id"
                  type="button"
                  class="swatch"
                  :style="{ background: `linear-gradient(158deg, ${item.colors[0]}, ${item.colors[1]})` }"
                  :aria-pressed="themeId === item.id"
                  :title="item.name"
                  :aria-label="`卡面 ${item.name}`"
                  @click="themeId = item.id"
                />
              </div>
            </div>
          </fieldset>

          <button class="go" :disabled="!canSubmit">
            <span v-if="status === 'loading'" class="spinner" aria-hidden="true"></span>
            {{ status === 'loading' ? '正在落笔' : message ? '换一个说法' : '生成祝福' }}
          </button>
        </form>
      </section>

      <section class="stage">
        <article class="card" :style="cardFace">
          <p class="mark">{{ theme.icon }}</p>
          <p class="to">致 {{ form.receiver || '……' }}</p>
          <div class="rule"></div>
          <p v-if="status === 'loading'" class="message placeholder">正在为你斟酌措辞……</p>
          <p v-else class="message">{{ message || '写好左边的内容，这里会出现你的祝福。' }}</p>
          <p class="date">{{ today }}</p>
        </article>

        <div v-if="message" class="after">
          <p class="from">本次文案来自 · {{ sourceLabel }}</p>
          <textarea v-model="message" rows="4" aria-label="修改祝福文案" />
          <div class="actions">
            <button type="button" class="main" :disabled="sharing" @click="share">
              {{ sharing ? '生成中…' : '生成分享链接' }}
            </button>
            <button type="button" @click="copyText">复制文案</button>
          </div>
          <div v-if="shareUrl" class="link">
            <p class="url">{{ shareUrl }}</p>
            <p class="tip">打开这条链接只会看到贺卡本身，没有任何其他内容。</p>
          </div>
        </div>
      </section>
    </main>

    <footer>祝福由模型起草，请你确认后再发出 · 模型密钥只保存在服务端</footer>
    <p v-if="toast" class="toast" role="status">{{ toast }}</p>
  </div>
</template>
