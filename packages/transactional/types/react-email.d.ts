import React from "react"

declare module "@react-email/components" {
  export const Html: React.ComponentType<React.HTMLAttributes<HTMLHtmlElement>>
  export const Head: React.ComponentType<React.HTMLAttributes<HTMLHeadElement>>
  export const Body: React.ComponentType<React.HTMLAttributes<HTMLBodyElement>>
  export const Preview: React.ComponentType<{ children?: React.ReactNode }>
  export const Container: React.ComponentType<
    React.HTMLAttributes<HTMLTableElement>
  >
  export const Section: React.ComponentType<
    React.HTMLAttributes<HTMLTableElement>
  >
  export const Img: React.ComponentType<
    React.ImgHTMLAttributes<HTMLImageElement>
  >
  export const Heading: React.ComponentType<
    React.HTMLAttributes<HTMLHeadingElement>
  >
  export const Text: React.ComponentType<
    React.HTMLAttributes<HTMLParagraphElement>
  >
  export const Button: React.ComponentType<
    React.AnchorHTMLAttributes<HTMLAnchorElement>
  >
  export const render: (component: React.ReactElement) => Promise<string>
  export const toPlainText: (html: string) => string
}
