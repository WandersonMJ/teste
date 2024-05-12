# **Configuração do Projeto samu-api**

### Este guia passo a passo cobre a configuração do ambiente de desenvolvimento para o projeto samu-api em um sistema Windows.

#### Pré-requisitos

    Windows 10 ou superior
    Acesso à internet
    Permissões de administrador no sistema

#### 1. Instalação do Git

#### Git é um sistema de controle de versão distribuído.

- Baixe o Git de Git SCM: https://git-scm.com/download/win
- Execute o instalador e siga as instruções na tela.
- Confirme a instalação abrindo um terminal e digitando:

    #### CMD:

        git --version



#### 2. Instalação do Node.js e npm

#### Node.js é essencial para rodar e desenvolver aplicações em JavaScript no servidor. O npm é o gerenciador de pacotes para JavaScript.

- Baixe o instalador do Node.js em Node.js official site: https://nodejs.org/en
- Execute o instalador e siga as instruções na tela.
- Confirme a instalação abrindo um terminal e digitando:

    #### CMD:

      node -v
  
      npm -v


#### 3. Instalação do Docker no Windows

#### Verifique se a virtualização está habilitada: Abra o Gerenciador de Tarefas, vá até a aba "Desempenho" e verifique se a "Virtualização" está habilitada. Se não estiver, você pode precisar alterar as configurações na BIOS do seu sistema.

- Baixe o Docker Desktop para Windows: Acesse Docker Hub e clique em "Get Docker" para baixar o instalador: https://www.docker.com/products/docker-desktop/

##### Instale o Docker Desktop:
- Execute o instalador baixado.
- Siga as instruções na tela. Você pode precisar habilitar o WSL 2 e instalar um pacote de atualização do kernel Linux para Windows, dependendo de sua configuração atual.
- Reinicie seu computador se solicitado.

- Verifique a instalação: Abra um terminal e digite:
  
  #### CMD:
  
      docker --version 
      
      docker-compose --version 
      
- para verificar se ambos foram instalados corretamente.


#### 4. Instalação do Yarn

#### Yarn é um gerenciador de pacotes alternativo ao npm.

- No mesmo terminal, instale o Yarn globalmente com npm:

    #### CMD:

      npm install --global yarn

- Verifique a instalação:

    #### CMD:

      yarn --version

#### 5. Instalando Dependências

#### Instale todas as dependências necessárias para o projeto com Yarn:

  - No mesmo terminal:

    #### CMD:

        yarn install

#### 6. Iniciando o banco de dados (MONGO)

#### No terminal navegue até a raiz do projeto ( onde está o docker-compose.yml ) 

  - digite:

    #### CMD:

        docker-compose up -d

  - Se sentir necessidade rode o seguinte comando para verificar os logs do container:

    #### CMD:
    
        docker-compose logs -f

  - Para acessar o container pelo terminal o comando é:

    #### CMD:

        docker exec -it samu-api_mongo_1 mongo -u root -p example --authenticationDatabase admin

#### 6. Executando o Projeto

#### Execute o projeto utilizando o script definido em package.json:

#### CMD:

    yarn dev

- Este comando irá iniciar o servidor com nodemon, permitindo que ele reinicie automaticamente a cada alteração de arquivo detectada.
Pronto!

- Agora seu ambiente de desenvolvimento está configurado, e o servidor deve estar rodando e acessível no endereço http://localhost:3000.



