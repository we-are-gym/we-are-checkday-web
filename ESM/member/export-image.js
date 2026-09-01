// 파일 용도: 회원 상세 화면 내보내기 — html2canvas PNG 캡처·다운로드 + Mason API PDF 다운로드
// 기법: DOM 조작·다운로드 트리거만 담당 — 회원 조회(member-utils)·API 클라이언트(api-client)에 위임한다.
import { requestBlob } from "@infra/api-client.js";
import { memberStore } from "@member/member-store.js";
import { getMemberById } from "@member/member-utils.js";
import { queryOne } from "@tools/utils-dom.js";

/**
 * 회원 상세 화면을 html2canvas로 캡처해 PNG로 다운로드한다.
 * - 캡처 대상: <main> (회원 정보·통계·기록 또는 비교 패널 전체)
 * - 캡처 직전 상호작용 버튼(편집·이미지 저장·기록 행 삭제 등)을 잠시 숨겨 이미지에 노출되지 않게 하고,
 *   탭(.tab-btn)은 이미지에 그대로 노출되도록 둔다. 완료 후 숨김을 복원한다.
 * - 네이티브 <select>는 html2canvas가 텍스트를 아래로 치우쳐 그려 글자가 잘리므로,
 *   캡처 동안 선택된 옵션 텍스트를 담은 <div class="export-select">로 잠시 교체해 렌더한다.
 *
 * @param {string} memberId 대상 회원 member_ID (파일명에 사용)
 * @returns {void}
 */
export function exportMemberDetailPNG(memberId) {
	const target = queryOne("main");

	if (!target) {
		alert("내보낼 화면을 찾을 수 없습니다.");
		return;
	}

	if (typeof html2canvas === "undefined") {
		alert("이미지 생성 라이브러리(html2canvas)를 불러오지 못했습니다. 네트워크 확인 후 다시 시도하세요.");
		return;
	}

	// 캡처에서만 잠깐 숨길 상호작용 컨트롤 — 탭(.tab-btn)은 이미지에 노출하므로 제외한다
	const controls = target.querySelectorAll("a.btn, button:not(.tab-btn)");

	const restoreControls = () =>
		controls.forEach(el => {
			el.style.visibility = el.dataset.pngPrevVisibility || "";
			delete el.dataset.pngPrevVisibility;
		});

	controls.forEach(el => {
		el.dataset.pngPrevVisibility = el.style.visibility;
		el.style.visibility = "hidden";
	});

	// 비교 셀렉터를 텍스트 박스(<div class="export-select">)로 잠시 교체 — html2canvas의 select 텍스트 잘림 방지
	const selects = [...target.querySelectorAll(".compare-field select")];

	const restoredSelects = selects.map(sel => {
		const opt = sel.options[sel.selectedIndex];
		const div = document.createElement("div");

		div.className = "export-select";
		div.textContent = opt ? opt.text : "";
		div.style.width = `${sel.offsetWidth}px`;
		div.style.height = `${sel.offsetHeight}px`;

		sel.replaceWith(div);
		return { sel, div };
	});

	const restoreSelects = () => restoredSelects.forEach(({ sel, div }) => div.replaceWith(sel));

	html2canvas(target, {
		backgroundColor: "#131313",
		scale: 2,
		useCORS: true,
	})
		.then(canvas => {
			restoreSelects();
			restoreControls();

			const member = getMemberById(memberStore.getState().members, memberId);
			const link = document.createElement("a");
			link.download = `체크데이_${member ? member.name : "회원"}_${new Date().toISOString().slice(0, 10)}.png`;
			link.href = canvas.toDataURL("image/png");
			link.click();
		})
		.catch(err => {
			restoreSelects();
			restoreControls();
			alert(`이미지 생성에 실패했어요: ${err.message}`);
		});
}

/**
 * 회원 정보를 Mason API가 생성한 한 장짜리 PDF로 다운로드한다.
 * 서버 Content-Disposition의 파일명은 Blob 다운로드에서는 무시되므로,
 * 클라이언트에서 회원명·생성일로 파일명을 직접 명명한다.
 * @param {string} memberId 대상 회원 member_ID
 * @returns {Promise<void>}
 */
export async function downloadPdf(memberId) {
	const member = getMemberById(memberStore.getState().members, memberId);
	const name = member ? member.name : "회원";
	try {
		const blob = await requestBlob(`/members/${memberId}/pdf`);
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `체크데이_${name}_${new Date().toISOString().slice(0, 10)}.pdf`;
		document.body.appendChild(link);
		link.click();
		link.remove();
		URL.revokeObjectURL(url);
	} catch (err) {
		console.error("PDF 다운로드 실패:", err);
		// 401은 requestBlob 내부에서 goToLogin()이 이미 리다이렉트를 처리하므로 안내를 건너뛴다
		if (err?.status === 401) return;
		alert(`PDF 다운로드에 실패했습니다: ${err.message || "알 수 없는 오류"}`);
	}
}
