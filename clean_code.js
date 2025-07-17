const fs = require('fs');

// 파일 읽기
fs.readFile('game.js', 'utf8', (err, data) => {
    if (err) {
        console.error('파일을 읽는 중 오류가 발생했습니다:', err);
        return;
    }

    // 주석 제거 (한 줄 주석)
    let cleanedCode = data.replace(/\/\/.*$/gm, '');

    // 여러 줄 주석 제거
    cleanedCode = cleanedCode.replace(/\/\*[\s\S]*?\*\//g, '');

    // 연속된 빈 줄 제거
    cleanedCode = cleanedCode.replace(/\n\s*\n\s*\n/g, '\n\n');

    // 줄 끝의 공백 제거
    cleanedCode = cleanedCode.replace(/[ \t]+$/gm, '');

    // 빈 줄 시작 부분의 공백 제거
    cleanedCode = cleanedCode.replace(/\n[ \t]+\n/g, '\n\n');

    // 결과 파일 저장
    fs.writeFile('game_clean.js', cleanedCode, 'utf8', (err) => {
        if (err) {
            console.error('파일을 쓰는 중 오류가 발생했습니다:', err);
            return;
        }
        console.log('코드가 정리되어 game_clean.js에 저장되었습니다.');
    });
});