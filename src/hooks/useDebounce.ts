import { useEffect, useState } from 'react';

/**
 * useDebounce Hook
 * 특정 값이 변경된 후 지정된 시간이 지날 때까지 기다렸다가 값을 반환합니다.
 * 주로 API 호출이나 무거운 작업을 지연시킬 때 사용합니다.
 *
 * @param value 관찰할 값
 * @param delay 지연 시간 (ms)
 * @returns 지연된 값
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // delay 시간 후에 값을 업데이트하는 타이머 설정
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // 값이 변경되거나 컴포넌트가 언마운트되면 타이머 정리
        // (이전 타이머가 취소되고 새로운 타이머가 시작됨)
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}
