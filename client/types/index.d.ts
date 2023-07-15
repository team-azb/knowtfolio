declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.gif'
declare module '*.svg'

interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum: any;
}

// webpackでビルドする際に書き換わる変数
declare const __RenderOn__: "Client" | "Server"
declare module "*.module.css" {
    const classes: { readonly [key: string]: string };
    export default classes;
}