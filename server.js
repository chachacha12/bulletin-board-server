//아래 두 줄은 이제부터 express 라이브러리 사용하겠다는 뜻. 그냥 써두면 됨
const express = require('express')
const app = express() 

//폴더를 server.js에 등록해두어야 폴더안의 css, js파일, 이미지 파일 등의 파일들을 html에서 사용가능 
app.use(express.static(__dirname+'/public'))


//몽고디비를 서버와 연결해주는 코드 - url값은 몽고디비 -database- connect-drivers에 있는 링크넣기. 그후 내 db접속용 아이디+비번 링크중간에 넣기
const { MongoClient } = require('mongodb')

let db
const url = 'mongodb+srv://chachacha:chaminwoo0106!@cluster0.az9nsfq.mongodb.net/?retryWrites=true&w=majority'
new MongoClient(url).connect().then((client)=>{
  console.log('DB연결성공')
  db = client.db('forum') //내 db이름 넣기

  //아래 3줄 쓰면 서버 띄우기끝. 내 컴퓨터 포트를 오픈하는 명령
  app.listen(8080, () => {
    console.log('http://localhost:8080 에서 서버 실행중')
  })

}).catch((err)=>{
  console.log(err)
})
///////////////////////



//누가 메인페이지 접속시
app.get('/', (요청, 응답)=> {
    응답.sendFile(__dirname + '/index.html') //이건 웹페이지를 하나 보내줌. 인자로 보낼 웹페이지 경로값
})

//누가 /news로 접속하면 db에 데이터 저장해보기 연습
app.get('/news', (요청, 응답)=> {
    db.collection('post').insertOne({title : '어쩌구'})
    // 응답.send('오늘 비옴') //이거 보내주셈
})











