import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
    * {
        box-sizing: border-box;
        padding: 0;
        margin: 0;
    }

    html,
    body {
        font-size: 16px;
        max-width: 100vw;
        overflow-x: hidden;

        @media (max-width: 912px) {
            font-size: 14px;
        }
        
        @media (max-width: 414px) {
            font-size: 12px;
        }
    }

    a {
        text-decoration: none;
        color: inherit;
    }
`

export default GlobalStyle
