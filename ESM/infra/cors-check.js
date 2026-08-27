// 파일 용도: CORS 사전 검증 — fetch 결과 401/200 분기로 CORS 통과 여부 판단 (to-be)
// 기법: /healthz는 인증 불필요 200, /members는 인증 필요 401 — 401이면 CORS는 통과, 네트워크 에러면 CORS 차단으로 간주

/**
 * CORS 및 API 연결을 사전 검증한다
 * @returns {Promise<{ ok: boolean, status: number, cors: boolean }>}
 */
export async function checkCors() {
	try {
		// /healthz는 CORS 미들웨어 없이도 200, /members는 401이면 CORS 통과
		const res = await fetch(`${import.meta.env.VITE_API_BASE || ""}/healthz`.replace("//healthz", "/healthz"));
		if (res.ok) return { ok: true, status: res.status, cors: true };
		// fetch 자체는 성공했으나 401 등은 CORS 통과로 간주
		return { ok: false, status: res.status, cors: true };
	} catch (err) {
		// TypeError: Failed to fetch — CORS 차단 또는 네트워크 단절
		return { ok: false, status: 0, cors: false };
	}
}

/**
 * CORS 결과를 사용자 메시지로 변환한다
 * @param {{ ok: boolean, status: number, cors: boolean }} result
 * @returns {string}
 */
export function corsMessage(result) {
	if (!result.cors) return "API 연결 실패 — CORS 또는 네트워크를 확인하십시오";
	if (result.status === 401) return "API 연결 정상 — 로그인이 필요합니다";
	if (result.ok) return "API 연결 정상";
	return `API 응답 ${result.status}`;
}
