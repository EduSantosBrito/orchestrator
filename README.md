## Arquitetura Microfrontend com Single-SPA

### Como adicionar um novo projeto:

```shell
npx create-single-spa
```

O CLI irá fazer algumas perguntas:

- Directory for new project: Digite o nome da pasta do projeto

- Select type to generate: Você poderá selecionar um valor dentre: `single-spa application / parcel`, `in-browser utility module (styleguide, api cache, etc)` e `single-spa root config`. Caso queira saber mais sobre o que é cada tipo de microfrontend, acesse a [documentação do single-spa](https://single-spa.js.org/docs/module-types)

- **Caso tenha selecionado `single-spa application`:** Which framework do you want to use: Selecione o framework que irá utilizar no projeto

- Which package manager do you want to use: Selecione o gerenciador de pacotes que irá utilizar no projeto

- Will this project use Typescript: Digite `y` caso o projeto irá conter Typescript, `N` caso o contrário

- Organization name: Digite o nome da organização. É utilizado para diferenciar projetos, por exemplo a organização `fdte` pode conter o projeto `checkout` para um e-commerce e ter um outro projeto `checkout` em uma organização `fdte-lab` para testes de novas tecnologias.

- Project name: Digite o nome do projeto, aconselho ser o mesmo nome da pasta

Depois disso, você terá um projeto gerado.

**Mudanças necessárias (Caso tenha selecionado `single-spa application`):**

- Caso seu projeto tenha algum `assets`, no seu `webpack.config.js` você terá que importar os `assets` manualmente, pois o framework não lida com isso (aconselho utilizar o pacote `copy-webpack-plugin`):

    ```js
    return merge(defaultConfig, {
        // modify the webpack config however you'd like to by adding to this object
        plugins: [
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: "public",
                    },
                ],
            }),
        ],
    });
    ```
    Para acessar a pasta `public` no seu projeto, o framework injeta uma constante chamada `__webpack_public_path__` que pode ser utilizada a todo momento, exemplo:

    ```jsx
    const Image = () => {
        const publicPath = __webpack_public_path__;
        return <img src={`${publicPath}/images/logo.png`} />
    }
    ```

- Caso a versão do seu React for **17+**, e seu `babel.config.json` estiver dessa forma:

    ```json
    {
        "presets": [
            /*
                Outras informações
            */
            "@babel/preset-react"
        ]
        /*
            Outras informações
        */
    }
    ```
    Altere para:

    ```json
    {
        "presets": [
            /*
                Outras informações
            */
            [
                "@babel/preset-react",
                {
                    "runtime": "automatic"
                }
            ]
        ]
        /*
            Outras informações
        */
    }
    ```
- A pasta `src`, conterá os seguintes arquivos:
    ```
    [nome-da-sua-organização]-[nome-do-seu-projeto].js
    root.component.js
    root.component.test.js
    ```
    `root.component` pode ser alterado para o `App.js` padrão do React. Exemplo:

    ```jsx
    const App = () => {
        return <div>testing</div>
    }

    export default App;
    ```

    Após isso, você terá que alterar algumas informações no arquivo com esse padrão `[nome-da-sua-organização]-[nome-do-seu-projeto].js` (irei chamá-lo de entryPoint). Ele deve estar dessa forma:

    ```js
    import React from "react";
    import ReactDOM from "react-dom";
    import singleSpaReact from "single-spa-react";
    import Root from "./root.component";

    const lifecycles = singleSpaReact({
        React,
        ReactDOM,
        rootComponent: Root,
        errorBoundary(err, info, props) {
            // Customize the root error boundary for your microfrontend here.
            return null;
        },
    });

    export const { bootstrap, mount, unmount } = lifecycles;
    ```

    Altere o `rootComponent` para o `App.js` que você alterou, dessa forma:

    ```js
    import React from "react";
    import ReactDOM from "react-dom";
    import singleSpaReact from "single-spa-react";
    import App from "./App";

    const lifecycles = singleSpaReact({
        React,
        ReactDOM,
        rootComponent: App,
        errorBoundary(err, info, props) {
            // Customize the root error boundary for your microfrontend here.
            return null;
        },
    });

    export const { bootstrap, mount, unmount } = lifecycles;
    ```
> Após isso, vamos incluir o projeto no nosso orquestrador (você terá que ter um projeto do tipo `single-spa root config`, provavelmente já está criado):
- No arquivo `index.ejs`, você terá que incluir seu projeto no `script` com o tipo `systemjs-importmap`. **OBS**: Preste atenção em qual `systemjs-importmap` está colocando, pois existe o `importmap` de dependências compartilhadas e existe o `importmap` de projetos. Você deverá colocar no `importmap` de projetos. Exemplo:

    ```html
    <!-- Outras informações -->
    <script type="systemjs-importmap">
        {
            "imports": {
                "@organization/orchestrator": "//localhost:3000/organization-root-config.js",
                "@organization/your-project": "//localhost:9000/organization-your-project.js" //Adicione seu projeto dessa forma, cuidado com o trailing comma. Pode dar erro caso ele exista.
            }
        }
    </script>
    ```
- Feito isso, hora de registrar a aplicação **(Caso tenha selecionado `single-spa application`)**: No arquivo `organization-root-config.js` no seu orquestrador, adicione a seguinte informação:

    ```js
        registerApplication({
            name: "@organization/your-project",
            app: () => System.import("@organization/your-project"),
            activeWhen: ["/your-project"], // Essa propriedade aceita dois valores, um Array, que irá fazer a aplicação renderizar em todas as rodas apartir dos prefixos dentro do array, ou uma função que recebe location como parametro e espera um booleano como resposta.
            //Exemplo: activeWhen: (location) => location.pathname === 'login'
        });
    ```
- Após isso, em cada projeto que você for adicionar, aconselho configurar uma porta diretamente no `package.json`, para que não esqueça.

    ```json
    {
        "scripts": {
            // Outras informações
            "start": "webpack serve --port 9000",
            // Outras informações
        }
    }
    ```