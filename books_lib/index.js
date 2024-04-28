const http = require('http');
const fs = require('fs');
const url = require('url');

// Load users and books data from files
let users = loadJsonData('users.json');
let books = loadJsonData('books.json');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname } = parsedUrl;

    if (req.method === 'POST') {
        if (pathname === '/Users/CreateUser') {
            handleCreateUser(req, res);
        } else if (pathname === '/Users/AuthenticateUser') {
            handleAuthenticateUser(req, res);
        } else if (pathname === '/Books/Create') {
            handleCreateBook(req, res);
        } else if (pathname === '/Books/LoanOut' || pathname === '/Books/Update') {
            handleLoanOutOrUpdateBook(req, res);
        } else if (pathname === '/Books/Return') {
            handleReturnBook(req, res);
        }
    } else if (req.method === 'GET') {
        if (pathname === '/Users/getAllUsers') {
            handleGetAllUsers(req, res);
        }
    } else if (req.method === 'DELETE') {
        if (pathname === '/Books/Delete') {
            handleDeleteBook(req, res);
        }
    } else {
        notFound(res);
    }
});

const port = process.env.port || 4000;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

function loadJsonData(filename) {
    try {
        const data = fs.readFileSync(filename, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error loading ${filename}: ${error}`);
        return [];
    }
}

function saveJsonData(filename, data) {
    try {
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error saving ${filename}: ${error}`);
    }
}

function handleCreateUser(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const newUser = JSON.parse(body);
        users.push(newUser);
        saveJsonData('users.json', users);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User created successfully' }));
    });
}

function handleAuthenticateUser(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const { username, password } = JSON.parse(body);
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Authentication successful' }));
        } else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Authentication failed' }));
        }
    });
}

function handleGetAllUsers(req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(users));
}

function handleCreateBook(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const newBook = JSON.parse(body);
        books.push(newBook);
        saveJsonData('books.json', books);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Book created successfully' }));
    });
}

function handleLoanOutOrUpdateBook(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const { id, borrower } = JSON.parse(body);
        const book = books.find(b => b.id === id);
        if (book) {
            book.borrower = borrower;
            saveJsonData('books.json', books);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Book loaned out/updated successfully' }));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Book not found' }));
        }
    });
}

function handleReturnBook(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const { id } = JSON.parse(body);
        const book = books.find(b => b.id === id);
        if (book) {
            delete book.borrower;
            saveJsonData('books.json', books);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Book returned successfully' }));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Book not found' }));
        }
    });
}

function handleDeleteBook(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const { id } = JSON.parse(body);
        const index = books.findIndex(b => b.id === id);
        if (index !== -1) {
            books.splice(index, 1);
            saveJsonData('books.json', books);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Book deleted successfully' }));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Book not found' }));
        }
    });
}

function notFound(res) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
}
