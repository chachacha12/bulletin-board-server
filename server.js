//아래 두 줄은 이제부터 express 라이브러리 사용하겠다는 뜻. 그냥 써두면 됨
const express = require('express')
const app = express() 


//폴더를 server.js에 등록해두어야 폴더안의 css, js파일, 이미지 파일 등의 파일들을 html에서 사용가능 
app.use(express.static(__dirname+'/public'))


//아래 3줄 쓰면 서버 생성 끝. 내 컴퓨터 포트를 오픈하는 명령
app.listen(8080, () => {
    console.log('http://localhost:8080 에서 서버 실행중')
})

//누가 메인페이지 접속시
app.get('/', (요청, 응답)=> {
    응답.sendFile(__dirname + '/index.html') //이건 웹페이지를 하나 보내줌. 인자로 보낼 웹페이지 경로값
})

app.get('/news', (요청, 응답)=> {
    응답.send('오늘 비옴') //이거 보내주셈
})

//콜백함수 - 다른 함수 파라미터에 들어가는 함수임
// 1. 누가 /shop접속시 app.get()함수 실행됨
// 2. 그 다음 콜백함수 실행됨
// 자바스크립트에서 특정함수, 특정코드 순차적으로 실행하고 싶을때 콜백함수패턴 자주 사용
// (콜백함수 사용할 수 있는 곳들은 express만든 사람이 정의해둠)
app.get('/shop', (요청, 응답)=> {
    응답.send('쇼핑 페이지임') //이거 보내주셈
})

//express라이브러리 사용법일뿐임. 문법 이해할 필요없음. 
//서버 개바은 그냥 라이브러리 사용법 암기가 끝임











