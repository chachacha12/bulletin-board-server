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
    // db.collection('post').insertOne({title : '어쩌구'})
    응답.send('오늘 비옴') 
})

//컬렉션의 모든 document 출력하는방법!! -> 그냥 외워두기 
app.get('/list', async (요청, 응답)=> {
    let result = await db.collection('post').find().toArray() //await을 써야 다음줄 안넘어가고 실행 기다림
    console.log(result)  //터미널에 출력시켜줌
    응답.send('db에 있던 게시물')
})


/*
자바스크립트 문법 설명 - 이걸 통해 몽고db 컬렉션안의 원하는 데이터만 뽑아올 수 있음 

1. array 자료형
var a = [1,4,5]

출력할땐 : a[0], a[1] 등등


2. object 자료형 (여러 자료형을 키값 형태로 저장)

var b = {name : 'kim', age : 20 }

출력할땐 : b.name 등등

--> 몽고db에서 가져온 전체 컬렉션은 [{},{}] 이런식으로
array안에 object형 들어있음

*/






