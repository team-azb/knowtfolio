declare module '*.png'
declare module '*.jpg'
declare module '*.gif'
declare module '*.svg'

interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum: any;
}

declare module "*.module.css" {
    const classes: { readonly [key: string]: string };
    export default classes;
}