// 파일 용도: GUI 상태 스토어 단위 테스트
import { describe, expect, it } from "bun:test";
import { Store } from "../../ESM/infra/store.js";

describe("Store", () => {
	it("new Store({count:0}) → getState().count === 0", () => {
		const store = new Store({ count: 0 });
		expect(store.getState().count).toBe(0);
	});

	it("setState → 변경 반영", () => {
		const store = new Store({ count: 0 });
		store.setState(prev => ({ ...prev, count: 5 }));
		expect(store.getState().count).toBe(5);
	});

	it("update → 일부 필드만 병합", () => {
		const store = new Store({ count: 0, label: "a" });
		store.update({ count: 10 });
		expect(store.getState()).toEqual({ count: 10, label: "a" });
	});

	it("subscribe → 리스너 호출 확인", () => {
		const store = new Store({ count: 0 });
		let notified = false;
		store.subscribe(() => {
			notified = true;
		});
		store.setState(prev => ({ ...prev, count: 1 }));
		expect(notified).toBe(true);
	});

	it("subscribe 해제 후 미호출 확인", () => {
		const store = new Store({ count: 0 });
		let callCount = 0;
		const unsub = store.subscribe(() => {
			callCount++;
		});
		store.setState(prev => ({ ...prev, count: 1 }));
		unsub();
		store.setState(prev => ({ ...prev, count: 2 }));
		expect(callCount).toBe(1);
	});

	it("storage 주입 → 상태 변경 시 주입된 저장소에 영속화", () => {
		const store = new Map();
		const mockStorage = {
			getItem: key => (store.has(key) ? store.get(key) : null),
			setItem: (key, value) => store.set(key, value),
			removeItem: key => store.delete(key),
		};
		const s = new Store({ count: 0 }, { storageKey: "test.count", storage: mockStorage });
		s.setState(prev => ({ ...prev, count: 7 }));
		expect(store.get("test.count")).toBe('{"count":7}');
	});
});
