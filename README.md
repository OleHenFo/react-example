# Example React application with Node.js server

## Instructions
1. Install [Atom](https://atom.io/) and [Node.js](https://nodejs.org/en/).
2. Install the Flow static type checker, and the Atom addon Nuclide:
    ```sh
    npm install -g flow-bin
    apm install nuclide
    ```
3. Download and run example, and open source folder in Atom:
    ```sh
    git clone https://github.com/ntnu-tdat2004/react-example
    cd react-example
    atom .
    cd client
    npm install
    npm start&    # Source files are recompiled on changes
    cd ../server
    npm install
    npm start     # Server will restart on changes
    ```
    Note that only the JavaScript files in the src-folder are checked for type-errors through Flow.

4. Open http://localhost:3000
