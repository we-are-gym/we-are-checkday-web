// 파일 용도: 회원 상세 화면 내보내기 — 번들된 html2canvas로 PNG 캡처·다운로드 + Mason API PDF 다운로드
// 기법: DOM 조작·다운로드 트리거만 담당 — 회원 조회(member-utils)·API 클라이언트(api-client)에 위임한다.
import html2canvas from "@vendor/html2canvas.js";
import { requestBlob } from "@infra/api-client.js";
import { memberStore } from "@member/member-store.js";
import { getMemberById } from "@member/member-utils.js";
import { showToast } from "@shared/components/toast/toast.js";
import { queryOne } from "@tools/utils-dom.js";

/**
 * PNG 파일명을 조립한다.
 * @param {string | undefined} memberName 회원 이름
 * @param {Date} date 생성일
 * @returns {string} 파일명
 */
export function pngFileName(memberName, date) {
	return `체크데이_${memberName || "회원"}_${date.toISOString().slice(0, 10)}.png`;
}

/**
 * 캡처 직전 DOM 베일을 치우고 복원하는 함수를 반환한다.
 * - 상호작용 버튼(a.btn, button:not(.tab-btn))은 visibility로 숨긴다.
 * - 탭(.tab-btn)은 이미지에 그대로 노출되도록 제외한다.
 * - 비교 셀렉터(<select>)는 html2canvas 텍스트 잘림 방지를 위해 <div class="export-select">로 교체한다.
 *
 * @param {Element} target 캡처 대상
 * @returns {() => void} 베일 복원 함수
 */
function createExportVeil(target) {
	const controls = target.querySelectorAll("a.btn, button:not(.tab-btn)");
	controls.forEach(el => {
		el.dataset.pngPrevVisibility = el.style.visibility;
		el.style.visibility = "hidden";
	});

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

	return () => {
		restoredSelects.forEach(({ sel, div }) => div.replaceWith(sel));
		controls.forEach(el => {
			el.style.visibility = el.dataset.pngPrevVisibility || "";
			delete el.dataset.pngPrevVisibility;
		});
	};
}

/**
 * 대상 요소를 html2canvas로 캡처한다.
 * @param {Element} target 캡처 대상
 * @returns {Promise<HTMLCanvasElement>} 캔버스
 */
function capturePng(target) {
	return html2canvas(target, {
		backgroundColor: "#131313",
		scale: 2,
		useCORS: true,
	});
}

/**
 * 회원 상세 화면을 html2canvas로 캡처해 PNG로 다운로드한다.
 *
 * @param {string} memberId 대상 회원 member_ID (파일명에 사용)
 * @returns {void}
 */
export function exportMemberDetailPNG(memberId) {
	const target = queryOne("main");

	if (!target) {
		showToast("내보낼 화면을 찾을 수 없습니다.", { type: "error" });
		return;
	}

	const restore = createExportVeil(target);

	capturePng(target)
		.then(canvas => {
			restore();

			const member = getMemberById(memberStore.getState().members, memberId);
			const link = document.createElement("a");
			link.download = pngFileName(member?.name, new Date());
			link.href = canvas.toDataURL("image/png");
			link.click();
		})
		.catch(err => {
			restore();
			console.error("회원 상세 PNG 내보내기 실패:", err);
			showToast(`이미지 생성에 실패했어요: ${err.message}`, { type: "error" });
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
		// 401은 requestBlob 낸부에서 goToLogin()이 이미 리다이렉트를 처리하고,
		// 그 밖의 실패 안내 토스트는 requestBlob이 표시한다 — 여기서 중복 안내하지 않는다
	}
}
