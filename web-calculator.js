let allResults = null;
let filteredResults = [];
let curPage = 1;

function solve() {
    const num = [1, 2, 3, 4, 5, 6, 7, 8];
    const plus = 4;
    const res = new Map();

    function permute(arr) {
        if (arr.length === 0) return [[]];
        if (arr.length === 1) return [arr];

        const result = [];
        for (let i = 0; i < arr.length; i++) {
            const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
            const perms = permute(rest);

            for (const perm of perms) {
                result.push([arr[i], ...perm]);
            }
        }
        return result;
    }

    function getPlus(arr, k) {
        if (k === 0) return [[]];
        if (arr.length === 0) return [];

        const result = [];
        const first = arr[0];
        const rest = arr.slice(1);


        const withFirst = getPlus(rest, k - 1);
        for (const comb of withFirst) {
            result.push([first, ...comb]);
        }

        const withoutFirst = getPlus(rest, k);
        result.push(...withoutFirst);

        return result;
    }


    const numberPerms = permute(num);
    console.log(`총 순열: ${numberPerms.length}개`);

    const positions = [0, 1, 2, 3, 4, 5, 6];
    const plusPositions = getPlus(positions, plus);
    console.log(`+ 위치 조합: ${plusPositions.length}개`);




    let tot = 0;

    for (const numPerm of numberPerms) {
        for (const plusPos of plusPositions) {
            let expr = '';
            let cur = '';

            for (let i = 0; i < numPerm.length; i++) {
                cur += numPerm[i];
                if (i < numPerm.length - 1) {
                    if (plusPos.includes(i)) {
                        expr += cur + '+';
                        cur = '';
                    }
                }
                else {
                    expr += cur;
                }
            }

            const result = eval(expr); // TODO 위험한가..?
            tot++;

            if (!res.has(result)) {
                res.set(result, []);
            }
            res.get(result).push(expr);
        }
    }


    console.log(`총 조합: ${tot}개`);
    console.log(`c: ${res.size}개`);
    return res;
}



function calcResults() {
    const loadingDiv = document.getElementById('loading');
    const resultsDiv = document.getElementById('results');
    const calculateBtn = document.getElementById('calculateBtn');
    const exportBtn = document.getElementById('exportBtn');

    loadingDiv.style.display = 'block';
    resultsDiv.style.display = 'none';
    calculateBtn.disabled = true;

    setTimeout(() => {
        try {
            allResults = solve();
            displayResults();

            loadingDiv.style.display = 'none';
            resultsDiv.style.display = 'block';
            exportBtn.style.display = 'inline-block';
            calculateBtn.textContent = '다시 계산';
            calculateBtn.disabled = false;
        }

        catch (error) {
            console.error('E:', error);
            alert('Error');
            loadingDiv.style.display = 'none';
            calculateBtn.disabled = false;
        }
    }, 100);
}


function displayResults() {
    if (!allResults) return;

    const sortedResults = Array.from(allResults.entries()).sort((a, b) => a[0] - b[0]);

    const totalCombinations = sortedResults.reduce((sum, [_, expressions]) => sum + expressions.length, 0);

    document.getElementById('uniqueCount').textContent = sortedResults.length;
    document.getElementById('totalCombinations').textContent = totalCombinations.toLocaleString();
    document.getElementById('minValue').textContent = sortedResults[0][0];
    document.getElementById('maxValue').textContent = sortedResults[sortedResults.length - 1][0];



    filter();
}

function filter() {
    if (!allResults) return;

    const searchValue = document.getElementById('searchValue').value;
    const sortOrder = document.getElementById('sortOrder').value;

    let results = Array.from(allResults.entries());
    if (searchValue !== '') {
        const searchNum = parseInt(searchValue);
        results = results.filter(([value, _]) => value === searchNum);
    }


    switch (sortOrder) {
        case 'asc': // 오름차순
            results.sort((a, b) => a[0] - b[0]);
            break;
        case 'desc': //내림차순
            results.sort((a, b) => b[0] - a[0]);
            break;
        case 'countDesc': // 조합 내림차순
            results.sort((a, b) => b[1].length - a[1].length);
            break;
        case 'countAsc': // 조합 오름차순
            results.sort((a, b) => a[1].length - b[1].length);
            break;
    }

    filteredResults = results;
    curPage = 1;
    render();
}


function render() {
    const tbody = document.getElementById('resultsTableBody');
    const itemsPerPageSelect = document.getElementById('itemsPerPage').value;
    const itemsPerPage = itemsPerPageSelect === 'all' ? filteredResults.length : parseInt(itemsPerPageSelect);



    const startIdx = (curPage - 1) * itemsPerPage;
    const endIdx = Math.min(startIdx + itemsPerPage, filteredResults.length);


    const pageResults = filteredResults.slice(startIdx, endIdx);
    tbody.innerHTML = '';



    for (const [value, expressions] of pageResults) {
        const row = document.createElement('tr');

        // 결과값
        const valueCell = document.createElement('td');
        valueCell.className = 'result-value';
        valueCell.textContent = value;
        row.appendChild(valueCell);

        // 조합 개수
        const countCell = document.createElement('td');
        countCell.textContent = `${expressions.length}개`;
        row.appendChild(countCell);

        // 덧셈식
        const exprCell = document.createElement('td');
        const exprDiv = document.createElement('div');
        exprDiv.className = 'expressions';


        const displayCnt = Math.min(5, expressions.length);
        for (let i = 0; i < displayCnt; i++) {
            const exprItem = document.createElement('div');
            exprItem.className = 'expression-item';
            exprItem.textContent = `${expressions[i]} = ${value}`;
            exprDiv.appendChild(exprItem);
        }



        if (expressions.length > 5) {
            const showAllBtn = document.createElement('button');
            showAllBtn.className = 'show-all-btn';
            showAllBtn.textContent = `이외 ${expressions.length - 5}개..`;
            showAllBtn.onclick = () => showAllExpr(value, expressions);
            exprDiv.appendChild(showAllBtn);
        }

        exprCell.appendChild(exprDiv);
        row.appendChild(exprCell);

        tbody.appendChild(row);
    }

    renderPage(itemsPerPage);
}


function showAllExpr(value, expressions) {
    // S //
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 15px;
        max-width: 80%;
        max-height: 80%;
        overflow-y: auto;
    `;
    // E //

    const title = document.createElement('h2');
    title.textContent = `c: ${value}, ${expressions.length}개`;
    title.style.marginBottom = '20px';
    title.style.color = '#667eea';
    content.appendChild(title);

    const list = document.createElement('div');
    list.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 10px;
    `;

    expressions.forEach(expr => {
        const item = document.createElement('div');
        item.className = 'expression-item';
        item.textContent = `${expr} = ${value}`;
        list.appendChild(item);
    });

    content.appendChild(list);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '닫기';
    closeBtn.style.marginTop = '20px';
    closeBtn.onclick = () => modal.remove();
    content.appendChild(closeBtn);

    modal.appendChild(content);
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };

    document.body.appendChild(modal);
}



function renderPage(itemsPerPage) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    if (itemsPerPage >= filteredResults.length) {
        return;
    }

    const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

    const prevBtn = document.createElement('button');
    prevBtn.textContent = '← Prev';
    prevBtn.disabled = curPage === 1;
    prevBtn.onclick = () => {
        curPage--;
        render();
    };
    pagination.appendChild(prevBtn);

    const pageInfo = document.createElement('span');
    pageInfo.className = 'page-info';
    pageInfo.textContent = `${curPage} / ${totalPages} 페이지`;
    pagination.appendChild(pageInfo);

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next →';
    nextBtn.disabled = curPage === totalPages;
    nextBtn.onclick = () => {
        curPage++;
        render();
    };
    pagination.appendChild(nextBtn);

}

// TODO CSV
function exportResults() {
    if (!allResults) return;

    const sortedResults = Array.from(allResults.entries()).sort((a, b) => a[0] - b[0]);

    let csv = '\uFEFF'; // UTF-8 BOM for Excel
    csv += '결과값(c),조합개수,덧셈식\n';

    for (const [value, expressions] of sortedResults) {
        for (let i = 0; i < expressions.length; i++) {
            if (i === 0) {
                csv += `${value},${expressions.length},"${expressions[i]}"\n`;
            } else {
                csv += `,,,"${expressions[i]}"\n`;
            }
        }
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', '덧셈카드_결과.csv');
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

