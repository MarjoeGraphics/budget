import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

console.log('js.configs.recommended:', !!js.configs.recommended)
console.log('tseslint.configs.recommended:', !!tseslint.configs.recommended)
console.log('reactHooks.configs:', Object.keys(reactHooks.configs || {}))
if (reactHooks.configs && reactHooks.configs.flat) {
    console.log('reactHooks.configs.flat:', Object.keys(reactHooks.configs.flat))
} else {
    console.log('reactHooks.configs.flat is undefined')
}
console.log('reactRefresh.configs:', Object.keys(reactRefresh.configs || {}))
