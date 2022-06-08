const defaultConfig = {
    engine: [
        {
            name: '百度',
            alias: 'baidu',
            url: 'https://www.baidu.com/s?wd={query}',
        },
        {
            name: '谷歌',
            alias: 'google',
            url: 'https://www.google.com/search?q={query}',
        },
        {
            name: '搜狗',
            alias: 'sogou',
            url: 'https://www.sogou.com/web?query={query}',
        },
        {
            name: '360',
            alias: '360',
            url: 'https://www.so.com/s?ie=utf-8&q={query}',
        },
        {
            name: '必应',
            alias: 'bing',
            url: 'https://cn.bing.com/search?q={query}',
        },
        {
            name: 'GitHub',
            alias: 'github',
            url: 'https://github.com/search?q={query}',
        },
        {
            name: 'DuckDuckGo',
            alias: 'duckgo',
            url: 'https://duckduckgo.com/?q={query}',
        },
    ],
    wallpapers: [
        '/wallpapers/41a16ac2c344cdfb05a338300d8e65ff.jpg',
        '/wallpapers/436908caacee4cf39033dfeccef1b52c.jpg',
        '/wallpapers/1911ba51b928db58a41f619a955b6d7c.jpg',
    ],
    wallpaper: '/wallpapers/41a16ac2c344cdfb05a338300d8e65ff.jpg',
    isICPShow: true,
}

const baiduSuggestion = {
    trigger(e) {
        const scriptEl = document.createElement('script')
        scriptEl.src = `https://www.baidu.com/sugrec?prod=pc&wd=${e}&cb=baiduSuggestion.callback`
        scriptEl.id = 'baidu-suggestion'
        document.head.appendChild(scriptEl)
    },
    callback(e) {
        document.getElementById('baidu-suggestion').remove()
        vm.search.suggestion = e.g ? e.g.map(item => item.q).slice(0, 9) : []
    },
}

const vm = Vue.createApp({
    data() {
        return {
            pageCurrent: 1,
            search: {
                input: '',
                suggestion: [],
                suggestionCurrent: -1,
                engine: 0,
                engineTip: 0,
            },
            preferences: {
                list: ['搜索引擎', '样式', '备份与缓存'],
                engine: {
                    current: -1,
                    position: null,
                },
            },
            config: {},
        }
    },
    created() {
        const rawConfig = localStorage.getItem('config')
        this.config = rawConfig ? JSON.parse(rawConfig) : defaultConfig
    },
    methods: {
        runSearch(val) {
            const url = this.config.engine[this.search.engine].url.replace('{query}', val)
            setTimeout(() => window.open(url), 300)
        },
        inputKeyDown(e) {
            if (e.key === 'Tab') {
                if (this.search.engineTip !== 0) {
                    this.search.engine = this.search.engineTip
                    this.search.engineTip = 0
                    this.search.input = ''
                }
            } else if (e.key === 'Backspace') {
                if (this.search.input === '') this.search.engine = 0
            } else if (e.key === 'Escape') {
                this.search.input !== '' ? (this.search.input = '') : (this.search.engine = 0)
            } else if (e.key === 'ArrowUp') {
                if (this.search.suggestion.length === 0) return
                this.search.suggestionCurrent--
                if (this.search.suggestionCurrent < -1) {
                    this.search.suggestionCurrent = this.search.suggestion.length - 1
                }
            } else if (e.key === 'ArrowDown') {
                if (this.search.suggestion.length === 0) return
                this.search.suggestionCurrent++
                if (this.search.suggestionCurrent >= this.search.suggestion.length) {
                    this.search.suggestionCurrent = -1
                }
            }
        },
        inputSubmit() {
            if (this.search.input === '') {
                this.pageCurrent = 0
            } else {
                let val = this.search.input
                if (this.search.suggestionCurrent !== -1) {
                    val = this.search.suggestion[this.search.suggestionCurrent]
                }
                this.runSearch(val)
            }
        },
        saveConfigToStorage() {
            localStorage.setItem('config', JSON.stringify(this.config))
        },
        configICPShowSet() {
            this.config.isICPShow = !this.config.isICPShow
            this.saveConfigToStorage()
        },
        configWallpaperSet(index, type) {
            if (type === 'select') {
                this.config.wallpaper = this.config.wallpapers[index]
            } else if (type === 'remove') {
                this.config.wallpapers.splice(index, 1)
            }
            this.saveConfigToStorage()
        },
        configWallpaperAdd() {
            const url = document.querySelector('.preferences-block .wallpaper-add').value
            if (url === '') return
            this.config.wallpapers.push(url)
            this.saveConfigToStorage()
        },
        configEngineMenuShow(index, e) {
            this.preferences.engine.current = index
            this.preferences.engine.position = {
                x: e.clientX,
                y: e.clientY,
            }
        },
        configEngineAdd() {
            const keyArr = ['name', 'alias', 'url']
            const obj = {}
            keyArr.forEach(key => {
                const el = document.querySelector(`.preferences-engine-add input[name="${key}"]`)
                obj[key] = el.value
                el.value = ''
            })
            this.config.engine.push(obj)
            this.saveConfigToStorage()
        },
        configEngineMenuSelect(type) {
            if (type === 'top') {
                this.config.engine.unshift(this.config.engine.splice(this.preferences.engine.current, 1)[0])
            } else if (type === 'remove') {
                this.config.engine.splice(this.preferences.engine.current, 1)
            }
            this.saveConfigToStorage()
            this.preferences.engine = {
                current: -1,
                position: null,
            }
        },
        configBackup(type) {
            if (type === 'export') {
                const data = JSON.stringify(this.config)
                const blob = new Blob([data], { type: 'application/json' })
                const a = document.createElement('a')
                a.href = URL.createObjectURL(blob)
                a.download = 'seclusion-start-page-config.json'
                a.click()
            } else if (type === 'import') {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'application/json'
                input.onchange = e => {
                    const file = e.target.files[0]
                    const reader = new FileReader()
                    reader.onload = e => {
                        console.info(e.target.result)
                        this.config = JSON.parse(e.target.result)
                        this.saveConfigToStorage()
                        alert('导入成功')
                    }
                    reader.readAsText(file)
                }
                input.click()
            }
        },
        configClearCache() {
            this.config = defaultConfig
            this.saveConfigToStorage()
            alert('缓存已清除')
        },
    },
    watch: {
        'search.input'(val) {
            this.search.engineTip = 0
            for (let i = 0; i < this.config.engine.length; i++) {
                if (this.config.engine[i].alias.includes(val)) {
                    this.search.engineTip = i
                    break
                }
            }

            if (val !== '') {
                baiduSuggestion.trigger(val)
            } else {
                this.search.suggestion = []
                this.search.suggestionCurrent = -1
            }
        },
        'search.suggestionCurrent'(val) {
            const elForecast = document.querySelector('.search .suggestion')
            if (val === -1) {
                elForecast.scrollTo(0, 0)
            } else {
                const laterScroll = 42 + val * 36 - elForecast.clientHeight + 1 + 36 + 8
                elForecast.scrollTo(0, laterScroll)
            }
        },
    },
    computed: {
        containerSizeCalculate() {
            // 返回 div.main 的宽高
            // 如果不在搜索页，直接返回固定宽高。
            if (this.pageCurrent >= 0) return 'width:750px;height:calc(88vh - 70px);'
            // 宽度固定，如果搜索预测不为空，返回"header"的高，否则计算"header+预测内容"的高
            const suggestionLength = this.search.suggestion.length
            const h = 42 + (suggestionLength !== 0 ? 1 + 8 + suggestionLength * 36 + 8 : 0)
            return `width:540px;height:${h}px;`
        },
    },
}).mount('#app')
