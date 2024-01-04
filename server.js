//http://localhost:8080/list
//아래 두 줄은 이제부터 express 라이브러리 사용하겠다는 뜻. 그냥 써두면 됨
const express = require('express')
const app = express() 
//몽고디비 연결을 위한 작업
const { MongoClient, ObjectId } = require('mongodb')
//아래는 html파일의 form태크에서 PUT, DELETE 등의 api를 이쁘게 써줄거면 필요한 작업 - 이거전에 npm install 어쩌구도 해줘야함
const methodOverride = require('method-override')

///아래는 html파일의 form태크에서 PUT, DELETE 등의 api를 이쁘게 써줄거면 필요한 작업
app.use(methodOverride('_method'))
//폴더를 server.js에 등록해두어야 폴더안의 css, js파일, 이미지 파일 등의 파일들을 html에서 사용가능 
app.use(express.static(__dirname+'/public'))
//ejs세팅끝 - (html문서에 DB데이터 꽂기위한 작업)
//html파일에 데이터 넣고 싶으면 .ejs파일로 만들면 가능. html파일과 거의 같다고 보면됨(views폴더 만들고 그 안에 넣는게 국룰)
app.set('view engine','ejs')
//클라이언트에서 보낸 데이터 서버에서 받아보려면 이거필요 즉, 요청.body쓰려면 이거 필요 - 그냥 필수적으로 쓰고 시작하면됨
app.use(express.json())
app.use(express.urlencoded({extended:true}))


//몽고디비를 서버와 연결해주는 코드 - url값은 몽고디비 -database- connect-drivers에 있는 링크넣기. 그후 내 db접속용 아이디+비번 링크중간에 넣기
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

//글 수정페이지로 이동하는 작업
app.get('/edit/:id', async (요청,응답)=>{  

  let result = await db.collection('post').findOne({ _id : new ObjectId(요청.params.id)})
  console.log(result)
  응답.render('edit.ejs', {result : result})
  
})


//글 수정요청 받으면 수정해주는 작업 (수정기능은 PUT 등을 쓰는데 이건 ajax나 외부라이브러리 써야해서.. 나중에 배울거임)
app.put('/edit', async (요청,응답)=>{  

  //db의 데이터 수정해주는 로직 - 첫 {}안에는 수정할 document정보 넣기, 두번째 {}에는 덮어쓸 내용넣기
  // $set은 덮어쓰기고 $inc는 +나-해줄수 있음. $mul은 곱셈가능. $unset은 필드값 삭제(근데 이건 거의 안씀)
  let result = await db.collection('post').updateOne({ _id : new ObjectId(요청.body.id)},
    {$set : {title : 요청.body.title, content : 요청.body.content }}
  )

// 1. document 하나 수정은 updateOne()
// 2. document 여러개 수정은 updateMany()
// 3. $set / $inc 등으로 수정방법 결정가능
// 4. updateMany 쓸 때는 조건식써서 document 필터링 가능
// 5. 서버에 정보가 없으면 유저에게 보내라고 하거나 db에서 출력하기
// 6. method-oerride 쓰면 <form>에서 PUT/DELETE 요청 가능

  console.log(result) //result에는 수정결과 어떻게 되었는지 등 들어있음
  응답.redirect('/list')
})
  

//delete요청 받았을시, 글 삭제해주는 작업
app.delete('/delete', async (요청,응답)=>{  

  console.log(요청.query) 

  //db에서 글 삭제해주는 로직
  await db.collection('post').deleteOne({_id : new ObjectId(요청.query.docid)})
  응답.send('삭제완료')
})


// 페이지네이션 - 1,2,3...등등 페이지 바로가기 버튼 만들기 가능.
//url파라미터이용
//근데 skip()은 인자값이 엄청 커지면 되게 느려지는 단점 존재.
app.get('/list/:id', async (요청, 응답)=> {
  
  let result = await db.collection('post').find().skip( (요청.params.id-1) * 5).limit(5).toArray()  //몇개 skip하고 다음 5개 가져옴  응답.render('list.ejs', {posts : result} )
  응답.render('list.ejs', {posts : result} )
})


//페이지네이션 - 다음페이지 버튼만 가능 (빠르다는 장점. but 바로 다음 페이지로만 이동 가능)
app.get('/list/next/:id', async (요청, 응답)=> {
  let result = await db.collection('post').find( {_id : {$gt : new ObjectId(요청.params.id) }} ).limit(5).toArray()  
  응답.render('list.ejs', {posts : result} )
})

//그래서 페이지네이션에서 혹시 유저가 1에서 5페이지 가는 기능 만들거라, 글 순서가 중요하면, 그냥
// 1. ObjectId순으로 정렬가능
// 2. 날짜기록해서 날짜순 정렬가능
// 이렇게 2가지 주로 이용하는듯.  근데 사실 글 순서가 중요한 서비스 별로 없음.