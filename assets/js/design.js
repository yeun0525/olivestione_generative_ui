// Legend Customize
const getOrCreateLegendList = (chart, id) => {
	// getOrCreateLegendList라는 함수 정의 => 이 함수는 두 개의 매개변수, chart와 id를 받음.
	// chart: 차트 객체를 의미
	// id: HTML 요소의 ID나 선택자
	const legendContainer = document.querySelector(id);
	// legendContainer는 id에 해당하는 HTML 요소를 선택
	// ex) id가 #legend라면, document.querySelector('#legend')는 id="legend"인 요소를 선택하게 됨
	let listContainer = legendContainer.querySelector('.inner');
	// listContainer는 legendContainer 내부에서 클래스가 inner인 요소를 찾음
	// legendContainer 안에 .inner 클래스가 있는 요소가 있으면 그것을 가져옴 => 없다면 listContainer는 null

	if (!listContainer) {
		listContainer = document.createElement('div');
		listContainer.classList = 'inner';
		// 만약 listContainer가 존재하지 않는다면(if (!listContainer)),
		// 즉 .inner 클래스가 없는 경우: 새로운 <div> 요소를 생성하고, 이 요소에 클래스 inner를 부여
		// ! : 논리 NOT 연산자, JavaScript에서 부정(negation)을 의미

		legendContainer.appendChild(listContainer);
		// appendChild(): 특정 부모 요소에 자식 요소를 추가하는 메서드
		// 즉, listContainer라는 요소를 legendContainer의 마지막 자식 요소로 추가하는 코드
	}

	return listContainer;
	// return: 함수나 메서드의 실행을 끝내고, 지정된 값을 호출한 곳으로 돌려주는 명령어
	// 즉, 이 코드는 함수나 메서드 내에서 listContainer라는 값을 반환하는 역할
};
const htmlLegendPlugin = {
	id: 'htmlLegend',
	afterUpdate(chart, args, options) {
		// afterUpdate(chart, args, options): afterUpdate는 차트가 업데이트된 후 호출되는 메서드 / chart = 차트 객체, args = 메서드 인수들, options = 플러그인 옵션을 담고 있음
		const inner = getOrCreateLegendList(chart, options.container);
		// getOrCreateLegendList: htmlLegend를 그릴 DOM 요소를 가져오거나 생성하는 함수 / 이 함수는 options.container에서 지정된 HTML 요소 안에 범례 리스트를 표시할 준비를 함

		// Remove old legend items
		while (inner.firstChild) {
			inner.firstChild.remove();
		}
		// inner 안에 존재하는 이전 범례 항목들을 모두 제거하는 코드 / while 루프를 통해 첫 번째 자식 요소를 계속 제거하여 이전 범례를 청소

		// Reuse the built-in legendItems generator
		const items = chart.options.plugins.legend.labels.generateLabels(chart);
		// 차트에서 기본으로 제공하는 범례 항목을 generateLabels 메서드를 사용해 가져옴 / 이 항목들은 legend.labels 속성에 정의된 규칙에 따라 생성

		items.forEach((item) => {
			const row = document.createElement('button');
			row.classList = 'row';
			row.setAttribute('type', 'button');
			// 각 범례 항목마다 <button> 요소를 생성하고, 클래스와 타입을 설정 / 이 버튼이 범례 항목을 나타냄
			row.onclick = () => {
				const { type } = chart.config;
				if (type === 'pie' || type === 'doughnut') {
					// Pie and doughnut charts only have a single dataset and visibility is per item
					chart.toggleDataVisibility(item.index);
				} else {
					chart.setDatasetVisibility(
						item.datasetIndex,
						!chart.isDatasetVisible(item.datasetIndex)
					);
				}
				chart.update();
				// 사용자가 범례 항목을 클릭했을 때의 동작을 정의
				// pie나 doughnut 차트인 경우, 클릭된 데이터 항목의 가시성을 토글
				// 다른 유형의 차트인 경우, 해당 데이터 세트의 가시성을 토글
				// 이후 chart.update()를 호출해 차트를 새로고침
			};

			// Color box
			const colorBox = document.createElement('span');
			colorBox.classList = 'color';
			colorBox.style.backgroundColor = item.fillStyle;
			// 범례 항목의 색상을 나타내는 span 요소를 생성, item.fillStyle에서 가져온 색상으로 배경을 설정
			// item.fillStyle : Chart.js에서 각 범례 항목에 대한 색상 정보를 나타냄 / 이 속성은 범례 항목과 대응되는 차트의 데이터 항목에 설정된 색상
			// 예를 들어, 파이 차트에서 데이터 항목이 파란색으로 그려졌다면, 해당 항목의 범례에서 item.fillStyle은 "파란색" 값을 가지게 되어 범례 색상도 파란색으로 표시

			// Text
			const textBox = document.createElement('span');
			const textCont = document.createTextNode(item.text);
			textBox.classList = 'text';
			textBox.appendChild(textCont);

			row.appendChild(colorBox);
			row.appendChild(textBox);
			inner.appendChild(row);
		});
	},
};

// Tooltip Create
const getOrCreateTooltip = (chart) => {
	let tooltipEl = chart.canvas.parentNode.querySelector('div');

	if (!tooltipEl) {
		tooltipEl = document.createElement('div');
		tooltipEl.classList = 'graph-stackbar__tooltip';

		const textbox = document.createElement('div');
		textbox.classList = 'textbox';

		tooltipEl.appendChild(textbox);
		chart.canvas.parentNode.appendChild(tooltipEl);
	}
	return tooltipEl;
};
const externalTooltipHandler = (context) => {
	// *context는 별다른 의미가 있는 건 아니고 우리가 el이나 box 사용하는 것처럼 개발자가 설정한 변수명임*
	// Tooltip Element
	const { chart, tooltip } = context;
	const tooltipEl = getOrCreateTooltip(chart);
	// ** 이건 위에 getOrCreateTooltip 이라는 펑션 명을 가져온 것임. 이 const 공부 후 그쪽으로 넘어가자 **
	const dataIndex = tooltip.dataPoints[0].dataIndex;
	// * tooltip의 dataPoints의 첫번째에 위치한 숫자를 나타냄 *
	// dataIndex : 특정 데이터 포인트의 위치를 나타내는 의미 ex) 데이터셋이 [10, 20, 30]일 때, 이 배열의 인덱스는 0, 1, 2
	const datasetIndex = tooltip.dataPoints[0].datasetIndex;
	// datasetIndex : 차트에 여러 개의 데이터셋(예: 여러 라인의 그래프 또는 막대 차트의 여러 그룹)이 있을 때, datasetIndex는 그 중 몇 번째 데이터셋에 해당 데이터 포인트가 있는지를 가리킴
	// ex) 차트가 3개 있을 때 dataPoints[2] 라면 3번째 차트를 가리킨다는 뜻
	// tooltip.title = 09.15

	// Hide if no tooltip
	if (tooltip.opacity === 0) {
		// === : 엄격한 동등 비교 연산자 => 타입과 값 모두 동일한지 비교
		// ex) 1 === 1;            true (숫자 1과 숫자 1은 값과 타입이 모두 같음)
		// 1 === '1';          false (숫자와 문자열은 타입이 다름)
		// 'hello' === 'hello'; true (두 문자열의 값과 타입이 같음)
		// true === 1;         false (Boolean과 숫자는 타입이 다름)
		// null === undefined; false (null과 undefined는 타입이 다름)
		tooltipEl.style.opacity = 0;
		return;
		// return : 함수의 실행을 종료. 즉, 이 코드가 포함된 함수는 여기서 끝나고 이후 코드는 실행되지 않음.
	}
	// if 코드 해석 : tooltip의 opacity = 0이 참일 경우 tooltipEl의 opacity가 0이 된 후 if는 종료됨

	const cont = document.createTextNode(tooltip.body[0].lines[0]);
	// 1. document.createTextNode(): 주어진 텍스트를 포함하는 새로운 텍스트 노드를 생성 / 텍스트 노드는 DOM 트리에서 텍스트를 표현하는 객체
	// 2. tooltip.body[0].lines[0] : body의 첫번째 요소, lines의 첫번째 요소를 참조
	// 3. lines는 개발자가 정의한 변수나 속성
	const text = document.createElement('p');
	// 주어진 태그 이름(여기서는 'p')을 가지는 새로운 HTML 요소를 생성
	text.classList = 'text';
	// classList : HTML 요소의 클래스 목록을 조작할 수 있는 속성 / classList를 사용하면 클래스 추가, 제거, 토글 등의 작업을 쉽게 할 수 있음.
	// 주의할 점: classList는 일반적으로 add, remove, toggle 등의 메서드를 통해 조작하는 것이 권장 / 직접 문자열을 할당하면 기존의 클래스가 모두 제거되고 새 클래스만 설정되기 때문에, 이전에 설정된 클래스가 사라질 수 있음.
	// 그럼 어떻게 해야하는가? text.classList.add('text');

	const root = tooltipEl.querySelector('.textbox');
	// querySelector : 주어진 CSS 선택자에 맞는 첫 번째 요소를 반환하는 메서드 / 여기서는 .textbox라는 클래스가 적용된 첫 번째 요소를 선택

	// Remove old children
	while (root.firstChild) {
		root.firstChild.remove();
	}
	// while(조건): while은 반복문, 조건이 참인 동안 코드를 반복해서 실행 (조건이 항상 참이면 무한 루프에 빠질 수 있으므로 언젠가 거짓이 되도록 해야함)
	// root: 일반적으로 DOM 요소를 가리키는 변수 이름
	// while (root.firstChild) => root 요소에 첫번째 자식 노드가 있는 동안 반복문 실행
	// root.firstChild.remove() => root 요소에 첫번째 자식 노드 완전 삭제
	// remove()와 removerClass() 차이 : remove() = DOM 요소 자체를 삭제하는 메서드 , removerClass() = jQuery에서 제공하는 메서드, 특정 클래스 이름을 요소에서 제거 (jQuery에서 라이브러리에서만 사용 가능)

	// Add new children
	text.appendChild(cont);
	// text 요소의 자식으로 cont 요소를 추가
	root.appendChild(text);
	// root 요소의 자식으로 text 요소 추가
	// *공통* appendChild() : 선택한 요소의 마지막 자식으로 지정된 요소를 추가하는 메서드
	// root 요소 아래에 text 요소가 생기고, 그 안에 cont 요소가 중첩된 구조

	const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;
	// chart.canvas 객체에서 offsetLeft와 offsetTop 값을 꺼내 각각 positionX와 positionY라는 변수에 저장
	// offsetLeft : 해당 요소가 왼쪽에서 얼마나 떨어져 있는지 나타내는 값
	// offsetTop : 요소가 위쪽에서 얼마나 떨어져 있는지 나타내는 값
	// chart.canvas : chart 객체 내부에 있는 canvas 요소를 참조, 이 canvas 요소는 일반적으로 <canvas> 태그나 canvas 요소를 의미

	// Display, position, and set styles for font
	const graphAreaPadding = 23 * 2;
	// 차트의 그래프 영역에 적용할 패딩 값으로, 23을 두 배로 계산한 값.
	// 이 패딩 값은 툴팁이 그래프 영역에 너무 가깝게 위치하지 않도록 할 때 사용
	const parentWidth = chart.canvas.parentNode.clientWidth;
	// chart.canvas의 부모 요소의 너비(clientWidth)를 가져옴.
	// 이 값은 툴팁이 그려질 수 있는 최대 영역의 너비를 의미
	const defaultLeft = positionX + tooltip.caretX;
	// 툴팁이 나타날 기본적인 왼쪽 위치를 계산.
	// positionX는 캔버스 요소의 왼쪽에서의 거리이고, tooltip.caretX는 툴팁 내부에서의 화살표 위치를 의미. 둘을 더해 툴팁의 기본 왼쪽 좌표를 구합니다.
	const defaultRight = parentWidth - tooltip.caretX + 16;
	// 툴팁이 나타날 기본적인 오른쪽 위치를 계산.
	// 부모 요소의 전체 너비에서 tooltip.caretX 값을 뺀 후 16px을 더해 툴팁의 오른쪽 좌표를 구함.

	console.log('----------------------------------------------');
	console.log(tooltip);
	console.log(positionX);
	console.log(parentWidth);
	console.log(defaultRight);
	console.log('----------------------------------------------');
	// *디버깅 출력(console.log)*
	// tooltip, positionX, parentWidth, defaultRight 값을 콘솔에 출력.
	// 이를 통해 디버깅 시 각 값이 올바르게 계산되었는지 확인할 수 있음.

	tooltipEl.style.opacity = 1;
	// 툴팁의 투명도 설정. 이 코드는 툴팁을 완전히 보이도록 만듦 (opacity = 1)
	if (defaultLeft + tooltip.width >= parentWidth) {
		tooltipEl.style.left = 'auto';
		tooltipEl.style.right = defaultRight + 'px';
	} else {
		tooltipEl.style.left = defaultLeft + 'px';
		tooltipEl.style.right = 'auto';
	}
	tooltipEl.style.top = positionY + tooltip.caretY + 'px';
};
