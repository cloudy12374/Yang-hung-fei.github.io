import config from "/ipconfig.js";

// 等待页面加载完毕后执行以下代码
$(window).on("load", () => {
  searchUsers(searchURL());
});

$(document).ready(function () {
  listenPageLink();
  listenItemsPerPage();
  listenOrderBy();
  listenSearchInput();
});

// -------------------DataListener-------------------

function listenPageLink() {
  const pageLinks = $(".pagination .page-link");

  pageLinks.on("click", function () {
    const pageIndex = $(this).parent().index();
    const pageCount = pageLinks.length - 3; // 减去首个和最后两个箭头按钮
    let currentPage;

    if (pageIndex === 0) {
      currentPage = 1; // 第一个 .page-link 设置为1
    } else if (pageIndex === pageCount + 2) {
      currentPage = pageCount; // 最后一个 .page-link 设置为 pageCount
    } else {
      currentPage = pageIndex;
    }

    // 执行你的其他操作，例如更新 URL
    searchURL({ page: currentPage });
  });
}

function listenItemsPerPage() {
  $("#page").on("change", function () {
    const selectedValue = $(this).val();
    searchURL({ size: selectedValue });
  });
}

function listenSearchInput() {
  var inputElement = $("#search");
  inputElement.keypress(function (event) {
    if (event.which === 13) {
      searchURL({ search: inputElement.value });
    }
  });

  $("#button-search").on("click", () => {
    searchURL({ search: inputElement.value });
  });
}

function listenOrderBy() {
  $(".orderBy").on("click", (event) => {
    const newOrderBy = $(event.currentTarget).attr("dataId");
    toggleSortOrder(newOrderBy);
  });

  $(".sort").on("click", (event) => {
    event.stopPropagation();
    const newOrderBy = $(event.currentTarget)
      .closest(".orderBy")
      .attr("dataId");
    toggleSortOrder(newOrderBy);
  });
}

function toggleSortOrder(orderBy) {
  const currentOrderBy = currentSearchURL.searchParams.get("orderBy");
  const currentSort = currentSearchURL.searchParams.get("sort");
  const newSort =
    orderBy === currentOrderBy
      ? currentSort === "asc"
        ? "desc"
        : "asc"
      : "asc";
  searchURL({ orderBy, sort: newSort });
  // searchUsers();
}

// -------------------Fetch-------------------

let currentSearchURL;
function searchURL({
  orderBy = "USER_NAME",
  page = 1,
  size = 5,
  sort = "asc",
} = {}) {
  // 构建请求 URL，包括请求参数
  const search_inputed = document.getElementById("search").value;
  const page_selected = page; // 使用传递的参数值或默认值
  const itemsPerPage = size; // 使用传递的参数值或默认值
  const orderBy_selected = orderBy; // 使用传递的参数值或默认值
  const sort_selected = sort; // 使用传递的参数值或默认值

  console.log("search_inputed:", search_inputed);
  console.log("page_selected:", page_selected);
  console.log("itemsPerPage:", itemsPerPage);
  console.log("orderBy_selected:", orderBy_selected);
  console.log("sort_selected:", sort_selected);

  const url = new URL(config.url + "/manager/users");
  url.searchParams.append("search", search_inputed);
  url.searchParams.append("page", page_selected);
  url.searchParams.append("size", itemsPerPage);
  url.searchParams.append("orderBy", orderBy_selected);
  url.searchParams.append("sort", sort_selected);

  currentSearchURL = url;
  searchUsers(currentSearchURL);
}

function searchUsers(currentSearchURL) {
  let token = localStorage.getItem("Authorization_M");
  // deleteTableContent();

  // 发送 HTTP GET 请求
  try {
    const response = fetch(currentSearchURL.toString(), {
      method: "GET",
      headers: {
        Authorization_M: token,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((userData) => {
        // 处理服务器响应数据
        var code = userData.code;
        if (code === 200) {
          // 成功处理响应
          createPageButtons(userData.message);
          createResultTable(userData.message);
        } else {
          // 处理响应错误
        }
      })
      .catch((error) => {
        // 捕获 HTTP 请求或处理响应的错误
        console.error("Error:", error);
        // 输出服务器返回的文本
        if (error instanceof Response) {
          error.text().then((text) => {
            console.error("Server response:", text);
          });
        }
      });
  } catch (error) {
    // 捕获代码块内部的错误
    console.error("Error:", error);
  }
}

// -------------------HTML-------------------

function createPageButtons(response) {
  const paginationElements = document.getElementsByClassName("pagination");
  const responsePageSize = response.page;
  let html = "";

  // Create the "Previous" button
  html += `
    <li class="page-item">
      <a class="page-link" href="#" aria-label="Previous">
        <span aria-hidden="true">&laquo;</span>
      </a>
    </li>
  `;

  for (let i = 1; i <= responsePageSize; i++) {
    html += `
      <li class="page-item">
        <a class="page-link" href="#">${i}</a>
      </li>
    `;
  }

  // Loop through all pagination elements and set their innerHTML
  for (let i = 0; i < paginationElements.length; i++) {
    paginationElements[i].innerHTML = html;
  }
}

function createResultTable(response) {
  const resultTable_el = document.getElementById("resultTable");
  let html = ``;
  const userData = response.body;

  // 遍历userData数组
  userData.forEach((user) => {
    const userId = user.userId;
    const userName = user.userName;
    const userNickName = user.userNickName;
    const userPoint = user.userPoint;
    const userBirthday = user.userBirthday || "尚未設定";
    const userCreated = user.userCreated;
    const userGender = user.userGender || "尚未設定";
    const userAddress = user.userAddress || "尚未設定";
    const userPhone = user.userPhone || "尚未設定";
    const userPic =
      user.userPic === null
        ? "https://i.imgur.com/MqbE2rD.png"
        : `data:image/png;base64,` + user.userPic;
    const identityProvider =
      user.identityProvider === "Google"
        ? `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="2em"
      viewBox="0 0 512 512"
    >
      <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
      <path
        d="M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zM164 356c-55.3 0-100-44.7-100-100s44.7-100 100-100c27 0 49.5 9.8 67 26.2l-27.1 26.1c-7.4-7.1-20.3-15.4-39.8-15.4-34.1 0-61.9 28.2-61.9 63.2 0 34.9 27.8 63.2 61.9 63.2 39.6 0 54.4-28.5 56.8-43.1H164v-34.4h94.4c1 5 1.6 10.1 1.6 16.6 0 57.1-38.3 97.6-96 97.6zm220-81.8h-29v29h-29.2v-29h-29V245h29v-29H355v29h29v29.2z"
      />
    </svg>
  `
        : ``;

    // 创建表格行并添加到html中
    html += `
      <tr
        data-toggle="collapse"
        data-target="#collapse${userId}"
        aria-expanded="true"
        aria-controls="collapse${userId}"
        class="collapsed"
      >
        <th scope="row">${userId}</th>
        <td>${userName}　(${userNickName})</td>
        <td>${userPoint}</td>
        <td>${userBirthday}</td>
        <td>${userCreated}</td>
        <td>${identityProvider}</td>
      </tr>
      <tr>
        <td
          colspan="6"
          id="collapse${userId}"
          class="collapse acc"
          data-parent="#accordion"
        >
          <div style="display: flex">
            <div class="userPic">
              <img src="${userPic}" alt="userPic" style="background-color: #ececec"/>
            </div>
            <div class="userProfile">
              <div class="userGender">性別：　${userGender}</div>
              <div class="userPhone">電話：　${userPhone}</div>
              <div class="userAddress">地址：　${userAddress}</div>
              <div class="identityProvider"></div>
            </div>
          </div>
        </td>
      </tr>
    `;
  });

  // 将html添加到结果表格中
  resultTable_el.innerHTML = html;
}
