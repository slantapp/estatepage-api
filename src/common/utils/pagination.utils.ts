// import { Repository } from 'typeorm';

// export interface PaginationResult<T> {
//   data: T[];
//   currentPage: number;
//   totalPages: number;
//   totalItems: number;
// }

// interface PaginationOptions<T> {
//   repository: Repository<T>;
//   page: number;
//   limit: number;
//   whereCondition?: any;
//   relations?: string[];
// }

// export async function paginate<T>({
//   repository,
//   page,
//   limit,
//   whereCondition = {},
//   relations = [],
// }: PaginationOptions<T>): Promise<PaginationResult<T>> {
//   const offset = (page - 1) * limit;

//   const [data, total] = await repository.findAndCount({
//     where: whereCondition,
//     skip: offset,
//     take: limit,
//     relations,
//   });

//   return {
//     data,
//     currentPage: page,
//     totalPages: Math.ceil(total / limit),
//     totalItems: total,
//   };
// }
