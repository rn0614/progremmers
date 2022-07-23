var http = require('http');
var fs = require('fs');
var url = require('url');
const querystring = require('node:querystring');

function templateHTML(title, list, body){
    return `
    <!doctype html>
    <html>
    <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
    </head>
    <body>
    <h1><a href="/">WEB</a></h1>
    ${list}
    <a href="/create">create</a>
    ${body}
    </body>
    </html>
    `;
}

function templateList(filelist){
    var list='<ul>';
    var i=0;
    while(i<filelist.length){
        list = list+`<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`
        i+=1
    }
    list=list+'</ul>';
    return list;
}

var app = http.createServer(function(request,response){
    var _url = request.url; // queryString이 들어가는 부분
    var queryData = url.parse(_url, true).query;
    var pathname =url.parse(_url, true).pathname;
    console.log(pathname);
    if(pathname==='/'){
        if(queryData.id===undefined){
            fs.readdir('./data', function(err, filelist){
                var title='Welcome';
                var content='Hello javaScript';
                var list = templateList(filelist);
                var template= templateHTML(title, list, `<h2>${title}</h2>${content}`);
                response.writeHead(200);
                response.end(template);
            });
        }else{
            fs.readdir('./data', function(err, filelist){
                fs.readFile(`data/${queryData.id}`, 'utf8', function(err, content){
                    var title= queryData.id;
                    var list = templateList(filelist);
                    var template= templateHTML(title, list, `<h2>${title}</h2>${content}`);
                    response.writeHead(200);
                    response.end(template);
                })
            });
        }
    }else if(pathname==='/create'){
        fs.readdir('./data', function(err, filelist){
            var title='WEB-create';
            var list = templateList(filelist);
            var template= templateHTML(title, list, `<form action="http://localhost:3000/create_process"
            method="post">
                <p><input type="text" name="title" placeholder="title"></p>
                <p>
                    <textarea name="content" placeholder="content"></textarea>
                </p>
                <p>
                    <input type="submit">
                </p>
            </form>`);
            response.writeHead(200);
            response.end(template);
        });
    }else if(pathname==='/create_process'){
        var body='';
        request.on('data', function(data){
            body=body+data;
        });
        request.on('end',function(){
            let post =querystring.parse(body);
            var title = post.title;
            var content = post.content;
            console.log(content);
            fs.writeFile(`data/${title}`, content,'utf8', function(err){
                response.writeHead(302,{Location:`/?id=${title}`});
                response.end();
            })
        });
    }else{
        response.writeHead(404);
        response.end('Not Found');
    }
});
app.listen(3000);