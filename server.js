//아래 두 줄은 이제부터 express 라이브러리 사용하겠다는 뜻. 그냥 써두면 됨
const express = require('express')
const app = express() 

//폴더를 server.js에 등록해두어야 폴더안의 css, js파일, 이미지 파일 등의 파일들을 html에서 사용가능 
app.use(express.static(__dirname+'/public'))

//ejs세팅끝 - (html문서에 DB데이터 꽂기위한 작업)
//html파일에 데이터 넣고 싶으면 .ejs파일로 만들면 가능. html파일과 거의 같다고 보면됨(views폴더 만들고 그 안에 넣는게 국룰)
app.set('view engine','ejs')

//클라이언트에서 보낸 데이터 서버에서 받아보려면 이거필요 즉, 요청.body쓰려면 이거 필요 - 그냥 필수적으로 쓰고 시작하면됨
app.use(express.json())
app.use(express.urlencoded({extended:true}))


//몽고디비를 서버와 연결해주는 코드 - url값은 몽고디비 -database- connect-drivers에 있는 링크넣기. 그후 내 db접속용 아이디+비번 링크중간에 넣기
const { MongoClient, ObjectId } = require('mongodb')
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
    
    //ejs파일을 유저에게 보내줄때 render 사용함. ejs파일 경로값 넣기. 기본 경로는 views폴더로 되어서 views폴더 안에 있는 파일은 그냥 이름만 적으면됨
    // 서버데이터를 ejs파일에 넣으려면, 
    // 1. ejs파일로 데이터 전송 (2번째 인자에 object자료형으로 넣기)
    // 2. ejs 파일 안에서 <%=데이터이름%> 
    응답.render('list.ejs', {posts : result} )
})

//컬렉션의 모든 document 출력하는방법!! -> 그냥 외워두기 
app.get('/time', async (요청, 응답)=> {
  let t = new Date()

  응답.render('time.ejs', {time : t} )

})

//누군가 /write로 접속시 wirte.ejs파일 보여주기
app.get('/write', (요청, 응답)=> {
  응답.render('write.ejs') 
})

//클라이언트에서 /add로 post메소드로 보낸 데이터를 서버가 받아서 db에 저장해주는 작업
app.post('/add', async (요청, 응답)=> {
  console.log(요청.body)  //이러면 자바스크립트 object자료형으로 출력됨 

  //try문 실행하다가 혹시 에러나면 catch문 수행 (db에 데이터 넣는 로직 등 혹시 에러 가능한 곳에 사용)
  try {
    //이상한 데이터는 db저장 막기 위한 검사
    if(요청.body.title ==''){
      응답.send('제목 입력해라')
    }else{
      //db에 데이터 저장하는 법
      await db.collection('post').insertOne({title : 요청.body.title, content : 요청.body.content} )
      //유저가 무한대기상태에 빠질 수 있기에 서버기능 끝나면 항상 응답 보내주는게 좋음
      응답.redirect('/list') //redirect는 다른 페이지로 이동시켜줌
    }
  } catch (e) {
    console.log(e) //에러 메시지 출력해서 어떤 에러인지 터미널에서 확인가능
    응답.status(500).send('서버에러남')  //500은 서버 잘못으로 인한 에러라는뜻
  }
})

//글 눌렀을때 글 상세페이지 가는 로직 만들어볼거임
//유저가 /detail/어쩌구 접속하면 {_id:어쩌구}글을 db에서 찾아서 ejs파일에 박아서 유저에게 보내줄거임
//URL파라미터 문법 사용하면 비슷한 url가진 여러 API 여러개 만들 필요 없음
// 요청.params를 쓰면 유저가 파라미터에 넣은 데이터값 가져올 수 있음(여기선 aa에 해당하는 값 가져옴)
app.get('/detail/:id', async (요청,응답)=>{  // 유저가 : 뒤에 아무거나 입력해도 이거 실행
  
  //이 데이터 가진 document 1개 찾아옴. 여러개면 맨 앞에 1개만 가져옴
  let result = await db.collection('post').findOne({ _id : new ObjectId(요청.params.id)  }) 
  console.log(result)
  응답.render('detail.ejs', { post : result }) //유저가 /detail/5로 접속하면 _id가 5인 글내용을 ejs파일로 보내기

})


