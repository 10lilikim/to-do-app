// LocalStorage 키 명칭
const STORAGE_KEY = 'todo_app_todos';

// 할 일 목록 배열 & 현재 필터 상태 ('all' | 'active' | 'completed')
let todos = loadTodos();
let currentFilter = 'all';

// DOM 요소 참조
let todoInput;
let addBtn;
let todoList;
let totalCountEl;
let completedCountEl;
let filterButtonsContainer;
let clearCompletedBtn;

// LocalStorage에서 불러오기
function loadTodos() {
    try {
        const savedTodos = localStorage.getItem(STORAGE_KEY);
        return savedTodos ? JSON.parse(savedTodos) : [];
    } catch (e) {
        console.error('LocalStorage 불러오기 실패:', e);
        return [];
    }
}

// LocalStorage에 저장하기
function saveTodos() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (e) {
        console.error('LocalStorage 저장 실패:', e);
    }
}

// 앱 초기화 함수
function initApp() {
    todoInput = document.getElementById('todo-input');
    addBtn = document.getElementById('add-btn');
    todoList = document.getElementById('todo-list');
    totalCountEl = document.getElementById('total-count');
    completedCountEl = document.getElementById('completed-count');
    filterButtonsContainer = document.getElementById('filter-buttons');
    clearCompletedBtn = document.getElementById('clear-completed-btn');

    // 이벤트 리스너 등록
    addBtn.addEventListener('click', handleAddTodo);
    todoInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            handleAddTodo();
        }
    });

    // 2. 필터 버튼 이벤트 리스너 등록
    if (filterButtonsContainer) {
        filterButtonsContainer.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterButtonsContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                currentFilter = e.target.dataset.filter;
                renderTodos();
            });
        });
    }

    // 3. 완료 항목 일괄 삭제 버튼 이벤트 리스너
    if (clearCompletedBtn) {
        clearCompletedBtn.addEventListener('click', handleClearCompleted);
    }

    // 초기 화면 렌더링
    renderTodos();
}

// 할 일 추가 처리 함수
function handleAddTodo() {
    const text = todoInput.value.trim();

    // 빈 값 체크
    if (!text) {
        alert('할 일을 입력하세요');
        todoInput.focus();
        return;
    }

    // 1. 중복 방지 (대소문자 구분 없이 기존 항목과 비교)
    const isDuplicate = todos.some(todo => todo.text.trim().toLowerCase() === text.toLowerCase());
    if (isDuplicate) {
        alert('이미 등록된 할 일입니다');
        todoInput.focus();
        return;
    }

    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false
    };

    todos.push(newTodo);
    saveTodos();

    todoInput.value = '';
    todoInput.focus();

    renderTodos();
}

// 완료/미완료 토글 함수
function toggleTodo(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });

    saveTodos();
    renderTodos();
}

// 개별 항목 삭제 처리 함수
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);

    saveTodos();
    renderTodos();
}

// 3. 완료된 항목 일괄 삭제 함수
function handleClearCompleted() {
    const completedCount = todos.filter(t => t.completed).length;
    if (completedCount === 0) return;

    todos = todos.filter(t => !t.completed);
    saveTodos();
    renderTodos();
}

// 통계 및 컨트롤 상태 업데이트 함수
function updateStatsAndControls() {
    const totalCount = todos.length;
    const completedCount = todos.filter(todo => todo.completed).length;

    if (totalCountEl) totalCountEl.textContent = totalCount;
    if (completedCountEl) completedCountEl.textContent = completedCount;

    // 완료 항목 삭제 버튼 활성화/비활성화 상태 제어
    if (clearCompletedBtn) {
        clearCompletedBtn.disabled = completedCount === 0;
    }
}

// 할 일 목록 UI 렌더링 함수
function renderTodos() {
    todoList.innerHTML = '';

    // 통계 및 버튼 상태 업데이트
    updateStatsAndControls();

    // 2. 현재 선택된 필터에 따라 목록 필터링
    let filteredTodos = todos;
    if (currentFilter === 'active') {
        filteredTodos = todos.filter(todo => !todo.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(todo => todo.completed);
    }

    // 필터링 결과가 비어있는 경우
    if (filteredTodos.length === 0) {
        const emptyLi = document.createElement('li');
        emptyLi.className = 'empty-message';
        if (todos.length === 0) {
            emptyLi.textContent = '등록된 할 일이 없습니다.';
        } else if (currentFilter === 'active') {
            emptyLi.textContent = '진행 중인 할 일이 없습니다.';
        } else if (currentFilter === 'completed') {
            emptyLi.textContent = '완료된 할 일이 없습니다.';
        } else {
            emptyLi.textContent = '해당하는 할 일이 없습니다.';
        }
        todoList.appendChild(emptyLi);
        return;
    }

    // 목록 아이템 생성 및 삽입
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'todo-item-content';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => toggleTodo(todo.id));

        const span = document.createElement('span');
        span.className = 'todo-text';
        span.textContent = todo.text;

        contentDiv.appendChild(checkbox);
        contentDiv.appendChild(span);

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        deleteBtn.title = '삭제';
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

        li.appendChild(contentDiv);
        li.appendChild(deleteBtn);

        todoList.appendChild(li);
    });
}

// DOM 콘텐츠 로드 완료 시 앱 실행
document.addEventListener('DOMContentLoaded', initApp);
