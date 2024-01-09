//http://localhost:8080/list
//아래 두 줄은 이제부터 express 라이브러리 사용하겠다는 뜻. 그냥 써두면 됨
const express = require('express')
const app = express() 
//몽고디비 연결을 위한 작업
const { MongoClient, ObjectId } = require('mongodb')
//아래는 html파일의 form태크에서 PUT, DELETE 등의 api를 이쁘게 써줄거면 필요한 작업 - 이거전에 npm install 어쩌구도 해줘야함
const methodOverride = require('method-override')
//db에 유저의 비밀번호를 bcrypt알고리즘으로 해쉬 암호화 하기위한 셋팅
const bcrypt = require('bcrypt')
//환경변수를 저장해줄 파일을 따로 만들기 위한 셋팅
require('dotenv').config()



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


//passport 라이브러리 셋팅 (jwt나 세션, oauth등을 쉽게 사용하게 해줌-여기선 세션 사용함)
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const MongoStore = require('connect-mongo') //유저 로그인시 생성되는 세션 document를 몽고db에 자동 저장해주기위한 셋팅


app.use(passport.initialize())
app.use(session({
  secret: '암호화에 쓸 비번', //유저들에게 보낼 세션id를 이 비번으로 암호화암. 이거 털리면 개인정보 다 털릴듯
  resave : false,  //유저가 서버로 요청할때마다 세션 갱신할건지임. 보통 false함
  saveUninitialized : false,  //로그인 안해도 세션 만들것인지임. 보통 false함
  cookie : { maxAge : 60 * 60 * 1000 },
  store : MongoStore.create({
    mongoUrl : 'mongodb+srv://chachacha:chaminwoo0106!@cluster0.az9nsfq.mongodb.net/?retryWrites=true&w=majority',  //db접속용 url 적기
    dbName : 'forum' //세션 document를 저장해줄 db이름 적기
  })

}))

app.use(passport.session()) 
////////////////////////////////////////////////////////




//몽고디비를 서버와 연결해주는 코드 - url값은 몽고디비 -database- connect-drivers에 있는 링크넣기. 그후 내 db접속용 아이디+비번 링크중간에 넣기
let db
const url = process.env.DB_URL
new MongoClient(url).connect().then((client)=>{
  console.log('DB연결성공')
  db = client.db('forum') //내 db이름 넣기

  //아래 3줄 쓰면 서버 띄우기끝. 내 컴퓨터 포트를 오픈하는 명령. process.env.PORT이건 환경변수 저장해둔 .env파일에 있는값 가져오는법
  app.listen(process.env.PORT, () => {
    console.log('http://localhost:8080 에서 서버 실행중')
  })

}).catch((err)=>{
  console.log(err)
})
///////////////////////


//미들웨어 - 여러 api등에서 공통으로 들어가는 코드는 빼서 이렇게 작성해두고 사용가능
function checkLogin(요청, 응답, next){
  if(!요청.user){
    응답.send('로그인하세요') //여기서 응답하게 되면 밑에 코드들 (next()등)은 실행 안될거임. 참고로 알기.
  }
  next()
}


//이렇게 적으면 이 코드 밑에 있는 api들은 모두 checkLogin미들웨어 적용됨.
//app.use(checkLogin) 


//누가 메인페이지 접속시
app.get('/', checkLogin, (요청, 응답)=> {
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


//passport라이브러리로 로그인시 유저가 제출한 id. 비번을 db에 있는 값과 비교검사하는 코드임 
//이 코드 실행시키고 싶으면 passport.authenticate('local')() 사용하기
//id, 비번말고 다른 값들도 받아서 검사하고 싶으면 passReqToCallback 옵션 찾아보기
passport.use(new LocalStrategy(async (입력한아이디, 입력한비번, cb) => {
  //이 아래 코드들을 try catch로 묶어서 예외처리해도 좋을듯
  let result = await db.collection('user').findOne({ username : 입력한아이디})
  if (!result) {
    return cb(null, false, { message: '아이디 DB에 없음' })
  }

  //bcrypt라이브러리에 있는 함수 (해시 전 비번과 해시된 비번 입력시, 둘 비교해줌. 해시전 비번을 해시한 값과 해시값 같으면 true)
  if (await bcrypt.compare(입력한비번, result.password)) {  
    return cb(null, result)
  } else {
    return cb(null, false, { message: '비번불일치' });
  }
}))

//로그인성공하면 세션 만들어줌// done()안에 있는 내용 기록된 세션 document를 db에 만들어줌. 그리고 쿠키도 알아서 유저에게 보내줌
//요청.logIn()쓰면 자동실행됨
passport.serializeUser((user, done) => {
  process.nextTick(() => { //아래코드를 비동기적으로 처리해줌 (근데 아래코드가 db저장코드일텐데 사실 db저장은 알아서 비동기처리됨. 그래서 이거 없어도되긴함)
    //아래코드덕에 이제 로그인시 세션 document를 발행해줌. 그리고 그 docu의 _id를 쿠키에 적어 유저에게 보내줌
    //세션 유효기간 설정없으면 자동으로 2주임. (2주동안 로그인상태 유지)
    done(null, { id: user._id, username: user.username }) //세션에 저장해줄 내용(objectid와 유저아이디 저장)
  })
})


//유저가 세션id담긴 쿠키 보내면 db에 있는지, 유효기간 괜찮은지 등등 분석해주는 코드
//쿠키 이상없으면 현재 로그인된 유저정보 알려줌
//이 코드덕에 이제 아무 api에서나 요청.user 라는 코드 쓰면 현재 로그인된 유저의 정보를 출력가능함!! (이거 밑에 코드들만 요청.user가능할거임- 이 코드 밑에서 api기능개발하기)
//근데 deserializeUser 이 함수는 세션id담긴 쿠키가진 유저가 요청 날릴때마다 실행됨..비효율적..그래서 메인 페이지 갈때 등엔 이거 코드 안돌게도 가능. (특정 api에서만 동작하게 가능 - 구글찾아보기) 
//그래도 요청이 너무 많아서 db가 부담되면? -> redis 사용가능 (connect-redis 찾아보기)
//세션말고 그냥 jwt가 좋다면 jwt도 passport로 구현가능. 예제 검색해보기
passport.deserializeUser(async (user, done) => {
  //세션에 있는 유저정보 받아서 유저컬렉션에 있는 유저정보를 가져올거임 (세션정보는 좀 오래되어서 유저이름 같은거 바꼈을수 있기에)
  let result = await db.collection('user').findOne({_id : new ObjectId(user.id)})
  delete result.password //비번항목은 result에서 삭제하기
  process.nextTick(() => {
    return done(null, result) //여기 넣은값이 요청.user에 들어감
  })
})



//유저가 /login경로로 get요청보내면 로그인 진행하는 페이지를 보여줌
app.get('/login', async (요청, 응답)=> {
  console.log(요청.user)
  응답.render('login.ejs')
})


//유저가 /login경로로 post요청보내면,
//제출한 아이디 비번이 db에 있는지 확인하고 있으면 세션만들어줌
app.post('/login', async (요청, 응답, next)=> {
  //클라에서 받은 id, 비번과 db에 있는 id,비번 비교검사 했다가 에러나면 error인자에 값 들어옴
  //성공시 user인자에 유저정보 들어옴. 실패시엔 그 이유가 info인자에 들어옴
  passport.authenticate('local', (error, user, info)=> {  
    //예외처리해주기
    if(error) return 응답.status(500).json(error)  //에러가 났을때임//  .json이라고 쓰면 array나 object 데이터를 유저에게 보내줄 수 있음
    if(!user) return 응답.status(401).json(info.message) //해당 유저가 없을시
    요청.logIn(user, (err)=>{  //비교성공했을때 
      if(err) return next(err)
      응답.redirect('/') //로그인 완료시 실행할 코드
    })
   })(요청, 응답, next)
})


//로그인 기능만든거 이용해서 마이페이지 만들기
app.get('/mypage', async (요청, 응답)=> {
  console.log(요청.user)

  if(요청.user){
    응답.render('mypage.ejs', {user : 요청.user })
  }else{
    응답.send('로그인 하세요')
  }
})

//회원가입 페이지 보내줌
app.get('/register', async (요청, 응답)=> {
  응답.render('register.ejs')
})

//유저가 /register 경로로 post요청 보내면 회원가입 시켜줄거임
app.post('/register', async (요청, 응답)=> {

  let 해시 = await bcrypt.hash(요청.body.password, 10)  //보통 10정도 넣으면 적당히 많이 꼬아서 해슁함
  console.log(해시)

  await db.collection('user').insertOne({
    username : 요청.body.username,
    password : 해시
  })
  응답.redirect('/')  //메인페이지로 이동
  //근데 위에처럼하고 끝내지말고 username빈칸이거나, 이미 db에 있는 username이거나, 비번 짧은경우 등 예외처리도 해주기 꼭
})

