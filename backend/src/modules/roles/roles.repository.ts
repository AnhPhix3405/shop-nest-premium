import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './roles.entity';

@Injectable()
export class RolesRepository {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  /**
   * Find role by name using custom query
   * @param name - Role name to search for
   * @returns Promise<Role | null>
   */
  async findByName(name: string): Promise<Role | null> {
    return await this.roleRepository
      .createQueryBuilder('role')
      .where('LOWER(role.name) = LOWER(:name)', { name })
      .getOne();
  }

  /**
   * Find role by ID using custom query
   * @param id - Role ID to search for
   * @returns Promise<Role | null>
   */
  async findById(id: number): Promise<Role | null> {
    return await this.roleRepository
      .createQueryBuilder('role')
      .where('role.id = :id', { id })
      .getOne();
  }

  /**
   * Find role by name with exact match (case sensitive)
   * @param name - Exact role name
   * @returns Promise<Role | null>
   */
  async findByExactName(name: string): Promise<Role | null> {
    return await this.roleRepository
      .createQueryBuilder('role')
      .where('role.name = :name', { name })
      .getOne();
  }

  /**
   * Find roles by partial name match
   * @param partialName - Partial role name to search
   * @returns Promise<Role[]>
   */
  async findByPartialName(partialName: string): Promise<Role[]> {
    return await this.roleRepository
      .createQueryBuilder('role')
      .where('LOWER(role.name) LIKE LOWER(:partialName)', { 
        partialName: `%${partialName}%` 
      })
      .orderBy('role.name', 'ASC')
      .getMany();
  }

  /**
   * Check if role exists by name
   * @param name - Role name to check
   * @returns Promise<boolean>
   */
  async existsByName(name: string): Promise<boolean> {
    const count = await this.roleRepository
      .createQueryBuilder('role')
      .where('LOWER(role.name) = LOWER(:name)', { name })
      .getCount();
    
    return count > 0;
  }

  /**
   * Check if role exists by ID
   * @param id - Role ID to check
   * @returns Promise<boolean>
   */
  async existsById(id: number): Promise<boolean> {
    const count = await this.roleRepository
      .createQueryBuilder('role')
      .where('role.id = :id', { id })
      .getCount();
    
    return count > 0;
  }

  /**
   * Get all roles with custom ordering
   * @param orderBy - Field to order by ('name' | 'id')
   * @param order - Order direction ('ASC' | 'DESC')
   * @returns Promise<Role[]>
   */
  async findAllWithOrder(
    orderBy: 'name' | 'id' = 'name',
    order: 'ASC' | 'DESC' = 'ASC'
  ): Promise<Role[]> {
    return await this.roleRepository
      .createQueryBuilder('role')
      .orderBy(`role.${orderBy}`, order)
      .getMany();
  }

  /**
   * Find multiple roles by IDs
   * @param ids - Array of role IDs
   * @returns Promise<Role[]>
   */
  async findByIds(ids: number[]): Promise<Role[]> {
    if (ids.length === 0) {
      return [];
    }

    return await this.roleRepository
      .createQueryBuilder('role')
      .where('role.id IN (:...ids)', { ids })
      .orderBy('role.name', 'ASC')
      .getMany();
  }

  /**
   * Find multiple roles by names
   * @param names - Array of role names
   * @returns Promise<Role[]>
   */
  async findByNames(names: string[]): Promise<Role[]> {
    if (names.length === 0) {
      return [];
    }

    const lowerCaseNames = names.map(name => name.toLowerCase());
    
    return await this.roleRepository
      .createQueryBuilder('role')
      .where('LOWER(role.name) IN (:...names)', { names: lowerCaseNames })
      .orderBy('role.name', 'ASC')
      .getMany();
  }

  /**
   * Get total count of roles
   * @returns Promise<number>
   */
  async getTotalCount(): Promise<number> {
    return await this.roleRepository
      .createQueryBuilder('role')
      .getCount();
  }

  /**
   * Find roles with pagination
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise<{ roles: Role[], total: number }>
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10
  ): Promise<{ roles: Role[], total: number }> {
    const skip = (page - 1) * limit;

    const [roles, total] = await this.roleRepository
      .createQueryBuilder('role')
      .orderBy('role.name', 'ASC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { roles, total };
  }
}
