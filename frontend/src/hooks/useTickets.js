/**
 * 티켓 목록 관리 Hook
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { ticketService } from "../api/services/ticketService";
import { handleError } from "../utils/errorHandler";
import { useLoading } from "../contexts/LoadingContext";

export const useTickets = (initialParams = {}) => {
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0,
  });
  const [filters, setFilters] = useState({
    keyword: "",
    category: "",
    region: "",
    minPrice: null,
    maxPrice: null,
    status: "AVAILABLE",
    sortBy: "createdAt",
    sortDirection: "DESC",
    ...initialParams,
  });
  const [error, setError] = useState(null);
  const { loading, startLoading, stopLoading } = useLoading();

  // 카테고리 이름을 루트 카테고리 ID로 매핑 (DB 기준)
  const categoryMap = {
    뮤지컬: 1,
    연극: 2,
    콘서트: 3,
    스포츠: 4,
    전시: 5,
    "전시/행사": 5,
    클래식: 6,
    "클래식/무용": 6,
    기타: 7,
  };

  /**
   * 티켓 목록 조회
   */
  const fetchTickets = useCallback(
    async (params = {}) => {
      try {
        startLoading();
        setError(null);

        const searchParams = {
          ...filters,
          ...params,
          page: params.page ?? pagination.page,
          size: params.size ?? pagination.size,
        };

        // 백엔드는 ticketStatus를 기대하므로 status를 ticketStatus로 변환
        if (searchParams.status) {
          searchParams.ticketStatus = searchParams.status;
          delete searchParams.status;
        }

        // keyword를 eventName으로 변환 (백엔드 필드명)
        if (searchParams.keyword) {
          searchParams.eventName = searchParams.keyword;
          delete searchParams.keyword;
        }

        // category를 categoryId로 변환
        // 카테고리 이름을 ID로 매핑
        if (searchParams.category && typeof searchParams.category === "string") {
          const categoryId = categoryMap[searchParams.category];
          if (categoryId) {
            searchParams.categoryId = categoryId;
          }
          delete searchParams.category;
        }

        // sortBy와 sortDirection 추가
        if (filters.sortBy) {
          searchParams.sortBy = filters.sortBy;
        }
        if (filters.sortDirection) {
          searchParams.sortDirection = filters.sortDirection;
        }

        const response = await ticketService.getTickets(searchParams);

        if (response.success) {
          // 백엔드가 페이지네이션 객체를 반환하는 경우
          if (response.data && response.data.content) {
            const { content, page, size, totalPages, totalElements } = response.data;
            setTickets(content || []);
            // 값이 실제로 변경되었을 때만 업데이트
            const newPage = page ?? pagination.page;
            const newSize = size ?? pagination.size;
            if (
              newPage !== pagination.page ||
              newSize !== pagination.size ||
              totalPages !== pagination.totalPages ||
              totalElements !== pagination.totalElements
            ) {
              setPagination({
                page: newPage,
                size: newSize,
                totalPages: totalPages ?? 1,
                totalElements: totalElements ?? 0,
              });
            }
          } else if (Array.isArray(response.data)) {
            // 배열인 경우 (하위 호환성)
            setTickets(response.data);
            const newTotalElements = response.data.length;
            if (newTotalElements !== pagination.totalElements) {
              setPagination({
                page: pagination.page,
                size: pagination.size,
                totalPages: 1,
                totalElements: newTotalElements,
              });
            }
          } else {
            // 예상치 못한 형식
            setTickets([]);
            if (pagination.totalElements !== 0 || pagination.totalPages !== 0) {
              setPagination({
                page: pagination.page,
                size: pagination.size,
                totalPages: 0,
                totalElements: 0,
              });
            }
          }
        }
      } catch (err) {
        const message = handleError(err);
        setError(message);
      } finally {
        stopLoading();
      }
    },
    [filters, pagination.page, pagination.size, startLoading, stopLoading, categoryMap]
  );

  /**
   * 인기 티켓 조회 (최신순으로 대체)
   */
  const fetchPopularTickets = useCallback(
    async (limit = 10) => {
      try {
        startLoading();
        setError(null);

        const response = await ticketService.getTickets({
          status: "AVAILABLE",
          sortBy: "createdAt",
          sortDirection: "DESC",
          page: 0,
          size: limit,
        });

        if (response.success) {
          setTickets(response.data?.content || []);
        }
      } catch (err) {
        const message = handleError(err);
        setError(message);
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  /**
   * 최신 티켓 조회
   */
  const fetchRecentTickets = useCallback(
    async (limit = 10) => {
      try {
        startLoading();
        setError(null);

        const response = await ticketService.getTickets({
          status: "AVAILABLE",
          sortBy: "createdAt",
          sortDirection: "DESC",
          page: 0,
          size: limit,
        });

        if (response.success) {
          setTickets(response.data?.content || []);
        }
      } catch (err) {
        const message = handleError(err);
        setError(message);
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  /**
   * 내 티켓 조회 (판매자)
   */
  const fetchMyTickets = useCallback(
    async (params = {}) => {
      try {
        startLoading();
        setError(null);

        const response = await ticketService.getMyTickets({
          ...params,
          page: params.page ?? pagination.page,
          size: params.size ?? pagination.size,
        });

        if (response.success) {
          const { content, page, size, totalPages, totalElements } = response.data;

          setTickets(content || []);
          setPagination({
            page,
            size,
            totalPages,
            totalElements,
          });
        }
      } catch (err) {
        const message = handleError(err);
        setError(message);
      } finally {
        stopLoading();
      }
    },
    [pagination.page, pagination.size, startLoading, stopLoading]
  );

  /**
   * 검색어 업데이트
   */
  const updateKeyword = useCallback((keyword) => {
    setFilters((prev) => ({ ...prev, keyword }));
    setPagination((prev) => ({ ...prev, page: 0 }));
  }, []);

  /**
   * 필터 업데이트
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 0 }));
  }, []);

  /**
   * 페이지 변경
   */
  const changePage = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  /**
   * 페이지 크기 변경
   */
  const changePageSize = useCallback((newSize) => {
    setPagination((prev) => ({ ...prev, size: newSize, page: 0 }));
  }, []);

  /**
   * 정렬 변경
   */
  const changeSorting = useCallback((sortBy, sortDirection = "DESC") => {
    setFilters((prev) => ({ ...prev, sortBy, sortDirection }));
    setPagination((prev) => ({ ...prev, page: 0 }));
  }, []);

  /**
   * 필터 초기화
   */
  const resetFilters = useCallback(() => {
    setFilters({
      keyword: "",
      category: "",
      region: "",
      minPrice: null,
      maxPrice: null,
      status: "AVAILABLE",
      sortBy: "createdAt",
      sortDirection: "DESC",
    });
    setPagination((prev) => ({ ...prev, page: 0 }));
  }, []);

  /**
   * 새로고침
   */
  const refresh = useCallback(() => {
    fetchTickets();
  }, [fetchTickets]);

  // 필터나 페이지 변경 시 자동 조회
  // useRef를 사용하여 이전 값과 비교하여 실제 변경 시에만 호출
  const prevDepsRef = useRef(null);
  const isInitialMount = useRef(true);

  // fetchTickets의 최신 버전을 참조하기 위한 ref
  const fetchTicketsRef = useRef(fetchTickets);
  useEffect(() => {
    fetchTicketsRef.current = fetchTickets;
  }, [fetchTickets]);

  useEffect(() => {
    const currentDeps = {
      sortBy: filters.sortBy,
      sortDirection: filters.sortDirection,
      keyword: filters.keyword,
      eventName: filters.eventName,
      category: filters.category,
      categoryId: filters.categoryId,
      status: filters.status,
      ticketStatus: filters.ticketStatus,
      region: filters.region,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      page: pagination.page,
      size: pagination.size,
    };

    // 초기 마운트 시에는 무조건 호출
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevDepsRef.current = currentDeps;
      fetchTicketsRef.current();
      return;
    }

    // 실제로 변경된 경우에만 호출
    if (prevDepsRef.current) {
      const hasChanged = Object.keys(currentDeps).some(
        (key) => prevDepsRef.current[key] !== currentDeps[key]
      );

      if (hasChanged) {
        prevDepsRef.current = currentDeps;
        fetchTicketsRef.current();
      }
    } else {
      prevDepsRef.current = currentDeps;
      fetchTicketsRef.current();
    }
  }, [
    filters.sortBy,
    filters.sortDirection,
    filters.keyword,
    filters.eventName,
    filters.category,
    filters.categoryId,
    filters.status,
    filters.ticketStatus,
    filters.region,
    filters.minPrice,
    filters.maxPrice,
    pagination.page,
    pagination.size,
  ]);

  return {
    // 상태
    tickets,
    pagination,
    filters,
    loading,
    error,

    // 조회 함수
    fetchTickets,
    fetchPopularTickets,
    fetchRecentTickets,
    fetchMyTickets,

    // 필터/페이지 관리
    updateKeyword,
    updateFilters,
    changePage,
    changePageSize,
    changeSorting,
    resetFilters,
    refresh,
  };
};

export default useTickets;
